// Permissions API Client
// Handles all permission-related API calls to the REST backend

import { getOrCreateDeviceId } from '@/shared/utils/device'
import type {
  PermissionsResponse,
  PermissionValidationResponse,
  PermissionValidationRequest,
  ComputedPermissions
} from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Fetches user permissions from the API
 * Based on GET /api/v1/auth/permissions endpoint
 */
export async function fetchUserPermissions(
  token: string,
  deviceId?: string
): Promise<PermissionsResponse> {
  // TODO: Implementar endpoint real no backend
  // Por enquanto, retornar mock para evitar erro 404
  console.log('🚧 Mock: fetchUserPermissions called with token:', token?.substring(0, 10) + '...')

  return {
    success: true,
    data: {
      permissions: [
        'leads:read',
        'leads:write',
        'campaigns:read',
        'campaigns:write',
        'users:read',
        'dashboard:read'
      ],
      user: {
        id: 'mock-user-id',
        email: 'mock@example.com',
        name: 'Mock User',
        role: 'admin'
      },
      role: {
        id: 'admin',
        name: 'Administrator',
        permissions: [
          'leads:read',
          'leads:write',
          'campaigns:read',
          'campaigns:write',
          'users:read',
          'users:write',
          'dashboard:read'
        ]
      },
      organization: {
        id: 'mock-org',
        name: 'Mock Organization'
      }
    }
  }
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
  // TODO: Implementar endpoint real no backend
  // Por enquanto, retornar mock para evitar erro 404
  console.log('🚧 Mock: validatePermission called:', permission, resourceId)

  // Mock básico - aceitar todas as permissões por enquanto
  return {
    success: true,
    data: {
      hasPermission: true,
      permission,
      resource: resourceId,
      context: {
        userId: 'mock-user-id',
        role: 'admin',
        organizationId: 'mock-org'
      }
    }
  }
}

/**
 * Gets full permission context including user, role, organization data
 * This is a convenience method that returns the full response from fetchUserPermissions
 */
export async function fetchPermissionContext(
  token: string,
  deviceId?: string
): Promise<PermissionsResponse> {
  // Reutilizar o mock da fetchUserPermissions
  return fetchUserPermissions(token, deviceId)
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