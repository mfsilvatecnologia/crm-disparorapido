// Audit API Client
// Handles audit log API calls to the REST backend

import { getOrCreateDeviceId } from '../device'
import type {
  AuditLogsResponse,
  AuditLogRequest
} from '../../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

/**
 * Fetches audit logs with optional filters
 * Based on GET /api/v1/admin/audit-logs endpoint
 */
export async function fetchAuditLogs(
  token: string,
  filters?: {
    page?: number
    limit?: number
    action?: string
    userId?: string
    sessionId?: string
    from?: string
    to?: string
  }
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams()

  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.action) params.append('action', filters.action)
  if (filters?.userId) params.append('userId', filters.userId)
  if (filters?.sessionId) params.append('sessionId', filters.sessionId)
  if (filters?.from) params.append('from', filters.from)
  if (filters?.to) params.append('to', filters.to)

  const url = `${API_BASE_URL}/admin/audit-logs${params.toString() ? `?${params.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`)
  }

  const data: AuditLogsResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for audit logs request')
  }

  return data
}

/**
 * Creates an audit log entry
 * Based on POST /api/v1/admin/audit-logs endpoint
 */
export async function createAuditLog(
  token: string,
  auditRequest: AuditLogRequest
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(auditRequest),
  })

  if (!response.ok) {
    throw new Error(`Failed to create audit log: ${response.status} ${response.statusText}`)
  }

  // The API contract specifies a 201 response for successful creation
  return { success: true }
}

/**
 * Convenience method to log permission denial events
 */
export async function logPermissionDenial(
  token: string,
  permission: string,
  resourceId?: string,
  sessionId?: string,
  details?: Record<string, any>
): Promise<void> {
  const auditRequest: AuditLogRequest = {
    action: 'permission_denied',
    resource: permission,
    ...(resourceId && { resource_id: resourceId }),
    ...(sessionId && { session_id: sessionId }),
    details: {
      attempted_permission: permission,
      ...details
    }
  }

  try {
    await createAuditLog(token, auditRequest)
  } catch (error) {
    // Log audit failures but don't throw - we don't want to break app flow
    console.warn('Failed to log permission denial audit event:', error)
  }
}

/**
 * Convenience method to log successful permission grants
 */
export async function logPermissionGrant(
  token: string,
  permission: string,
  resourceId?: string,
  sessionId?: string,
  details?: Record<string, any>
): Promise<void> {
  const auditRequest: AuditLogRequest = {
    action: 'permission_granted',
    resource: permission,
    ...(resourceId && { resource_id: resourceId }),
    ...(sessionId && { session_id: sessionId }),
    details: {
      granted_permission: permission,
      ...details
    }
  }

  try {
    await createAuditLog(token, auditRequest)
  } catch (error) {
    console.warn('Failed to log permission grant audit event:', error)
  }
}

/**
 * Error handler for audit-related API errors
 */
export function handleAuditError(error: Error, context?: string): never {
  console.error(`Audit API error${context ? ` (${context})` : ''}:`, error)

  // Check for common HTTP error patterns
  if (error.message.includes('401')) {
    throw new Error('Authentication required - please login again')
  }

  if (error.message.includes('403')) {
    throw new Error('Access denied - admin permissions required for audit logs')
  }

  if (error.message.includes('400')) {
    throw new Error('Invalid audit log request')
  }

  // Re-throw original error if not a recognized pattern
  throw error
}