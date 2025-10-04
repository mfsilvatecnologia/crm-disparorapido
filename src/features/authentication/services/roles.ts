// Roles API Client
// Handles role management API calls to the REST backend

import { getOrCreateDeviceId } from '@/shared/utils/device'
import type { Role, PermissionSet } from '../../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RolesListResponse {
  success: boolean
  data: Role[]
}

export interface RoleResponse {
  success: boolean
  data: Role
}

export interface CreateRoleRequest {
  nome: string
  descricao: string
  permissoes: PermissionSet
}

/**
 * Fetches all available roles
 * Based on GET /api/v1/admin/roles endpoint
 */
export async function fetchRoles(token: string): Promise<RolesListResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status} ${response.statusText}`)
  }

  const data: RolesListResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for roles request')
  }

  return data
}

/**
 * Creates a new role
 * Based on POST /api/v1/admin/roles endpoint
 */
export async function createRole(
  token: string,
  roleData: CreateRoleRequest
): Promise<RoleResponse> {
  // Validate required fields
  if (!roleData.nome) {
    throw new Error('Role name is required')
  }
  if (!roleData.descricao) {
    throw new Error('Role description is required')
  }
  if (!roleData.permissoes) {
    throw new Error('Role permissions are required')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(roleData),
  })

  if (!response.ok) {
    throw new Error(`Failed to create role: ${response.status} ${response.statusText}`)
  }

  const data: RoleResponse = await response.json()

  if (!data.success) {
    throw new Error('API returned error for role creation')
  }

  return data
}