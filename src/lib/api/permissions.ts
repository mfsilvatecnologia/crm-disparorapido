// Permissions API Client
// Handles all permission-related API calls to the REST backend

import { getOrCreateDeviceId } from '../device'
import type {
  PermissionsResponse,
  PermissionValidationResponse,
  PermissionValidationRequest,
  ComputedPermissions
} from '../../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Fetches user permissions from the API
 * Based on GET /api/v1/auth/permissions endpoint
 */
export async function fetchUserPermissions(
  token: string,
  deviceId?: string
): Promise<ComputedPermissions> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': deviceId || getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch permissions: ${response.status} ${response.statusText}`)
  }

  const data: PermissionsResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for permissions request')
  }

  return data.data.permissions
}

/**
 * Validates a specific permission for the current user
 * Based on POST /api/v1/auth/permissions/validate endpoint
 */
export async function validatePermission(
  token: string,
  permission: string,
  resourceId?: string
): Promise<PermissionValidationResponse> {
  const requestBody: PermissionValidationRequest = {
    permission,
    ...(resourceId && { resource: resourceId })
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/permissions/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`Failed to validate permission: ${response.status} ${response.statusText}`)
  }

  const data: PermissionValidationResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for permission validation')
  }

  return data
}

/**
 * Gets full permission context including user, role, organization data
 * This is a convenience method that returns the full response from fetchUserPermissions
 */
export async function fetchPermissionContext(
  token: string,
  deviceId?: string
): Promise<PermissionsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/permissions`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': deviceId || getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch permission context: ${response.status} ${response.statusText}`)
  }

  const data: PermissionsResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for permission context request')
  }

  return data
}

/**
 * Error handler for permission-related API errors
 */
export function handlePermissionError(error: Error, context?: string): never {
  console.error(`Permission API error${context ? ` (${context})` : ''}:`, error)

  // Check for common HTTP error patterns
  if (error.message.includes('401')) {
    throw new Error('Authentication required - please login again')
  }

  if (error.message.includes('403')) {
    throw new Error('Access denied - insufficient permissions')
  }

  if (error.message.includes('404')) {
    throw new Error('Permission endpoint not found')
  }

  if (error.message.includes('500')) {
    throw new Error('Server error - please try again later')
  }

  // Re-throw original error if not a recognized pattern
  throw error
}