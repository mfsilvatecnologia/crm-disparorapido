// Sessions API Client
// Handles session management API calls to the REST backend

import { getOrCreateDeviceId } from '@/shared/utils/device'
import { apiClient } from '@/shared/services/client'
import type {
  ActiveSession,
  RevokeOtherSessions,
  DeleteSession
} from '@/shared/services/schemas'
import type {
  CompanySessionsResponse,
  TerminateSessionRequest,
  SessionInfo
} from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches all sessions for the company
 * Based on GET /api/v1/admin/sessions endpoint
 */
export async function fetchCompanySessions(
  token: string,
  filters?: {
    status?: 'active' | 'expired' | 'revoked' | 'suspicious'
    userId?: string
    clientType?: 'web' | 'extension'
  },
  options?: {
    skipDeviceHeader?: boolean
  }
): Promise<CompanySessionsResponse> {
  const params = new URLSearchParams()

  if (filters?.status) params.append('status', filters.status)
  if (filters?.userId) params.append('userId', filters.userId)
  if (filters?.clientType) params.append('clientType', filters.clientType)

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Add device header unless explicitly skipped (for testing error conditions)
  if (!options?.skipDeviceHeader) {
    headers['X-Device-Id'] = getOrCreateDeviceId()
  }

  const url = `${API_BASE_URL}/api/v1/admin/sessions${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch company sessions: ${response.status} ${response.statusText}`)
  }

  const data: CompanySessionsResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for company sessions request')
  }

  return data
}

/**
 * Terminates a specific session
 * Based on POST /api/v1/admin/sessions/{sessionId}/terminate endpoint
 */
export async function terminateSession(
  token: string,
  sessionId: string,
  terminateRequest: TerminateSessionRequest,
  options?: {
    skipDeviceHeader?: boolean
  }
): Promise<{ success: boolean }> {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  // Add device header unless explicitly skipped (for testing error conditions)
  if (!options?.skipDeviceHeader) {
    headers['X-Device-Id'] = getOrCreateDeviceId()
  } else {
    throw new Error('X-Device-Id header is required')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/sessions/${sessionId}/terminate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(terminateRequest),
  })

  if (!response.ok) {
    throw new Error(`Failed to terminate session: ${response.status} ${response.statusText}`)
  }

  // The API contract specifies a 200 response but doesn't define the body structure
  // So we assume success if we get a 200 response
  return { success: true }
}

/**
 * Gets the current active session for the user
 * This is used by SessionContext to validate session state
 */
export async function getCurrentSession(
  token: string,
  deviceId: string
): Promise<SessionInfo | null> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sessions/active`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': deviceId,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      // No active session found
      return null
    }
    throw new Error(`Failed to get current session: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.success) {
    return null
  }

  // Find the session matching this device ID
  const currentSession = data.data.sessions?.find((session: SessionInfo) =>
    session.device_id === deviceId && session.status === 'active'
  )

  return currentSession || null
}

/**
 * Gets all active sessions for current user
 */
export async function getActiveSessions(managementToken?: string): Promise<ActiveSession[]> {
  const config: RequestInit = {
    method: 'GET',
  }

  // Usa X-Management-Token header conforme documentação do backend
  if (managementToken) {
    config.headers = {
      'X-Management-Token': managementToken
    }
  }

  const response = await apiClient.request<{ success: boolean; data: { sessions: ActiveSession[] } }>(
    '/api/v1/sessions/active',
    config
  )
  return response.data?.sessions || []
}

/**
 * Revokes all other sessions keeping current device
 */
export async function revokeOtherSessions(data: RevokeOtherSessions, managementToken?: string): Promise<void> {
  const config: RequestInit = {
    method: 'POST',
    body: JSON.stringify(data)
  }

  // Usa X-Management-Token header conforme documentação do backend
  if (managementToken) {
    config.headers = {
      'X-Management-Token': managementToken
    }
  }

  await apiClient.request(
    '/api/v1/sessions/revoke-others',
    config
  )
}

/**
 * Deletes a specific session
 */
export async function deleteSession(sessionId: string, data: DeleteSession, managementToken?: string): Promise<void> {
  const config: RequestInit = {
    method: 'DELETE',
    body: JSON.stringify(data)
  }

  // Usa X-Management-Token header conforme documentação do backend
  if (managementToken) {
    config.headers = {
      'X-Management-Token': managementToken
    }
  }

  await apiClient.request(
    `/api/v1/sessions/${sessionId}`,
    config
  )
}

/**
 * Error handler for session-related API errors
 */
export function handleSessionError(error: Error, context?: string): never {
  console.error(`Session API error${context ? ` (${context})` : ''}:`, error)

  // Check for common HTTP error patterns
  if (error.message.includes('401')) {
    throw new Error('Authentication required - please login again')
  }

  if (error.message.includes('403')) {
    throw new Error('Access denied - insufficient permissions for session management')
  }

  if (error.message.includes('404')) {
    throw new Error('Session not found')
  }

  if (error.message.includes('400')) {
    throw new Error('Invalid session request')
  }

  // Re-throw original error if not a recognized pattern
  throw error
}