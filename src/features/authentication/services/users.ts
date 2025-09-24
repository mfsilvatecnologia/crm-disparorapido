// Users API Client
// Handles user role management API calls to the REST backend

import { getOrCreateDeviceId } from '../utils/device'
import type { UserRoleUpdateResponse, RoleUpdateRequest } from '../../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

/**
 * Updates a user's role
 * Based on PUT /api/v1/admin/users/{userId}/role endpoint
 */
export async function updateUserRole(
  token: string,
  userId: string,
  roleUpdate: RoleUpdateRequest
): Promise<UserRoleUpdateResponse> {
  // Validate required fields
  if (!roleUpdate.role) {
    throw new Error('Role is required')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roleUpdate),
  })

  if (!response.ok) {
    throw new Error(`Failed to update user role: ${response.status} ${response.statusText}`)
  }

  const data: UserRoleUpdateResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for user role update')
  }

  return data
}