// usePermissions Hook
// Manages permission state with React Query caching and session validation

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useSession } from '../contexts/SessionContext'
import { fetchUserPermissions, handlePermissionError } from '../lib/api/permissions'
import type { ComputedPermissions } from '../types/auth'

export function usePermissions() {
  const { user, token, permissions: authPermissions } = useAuth()
  const { isValidSession } = useSession()

  // More defensive permission loading with graceful fallbacks
  const {
    data: permissions,
    isLoading,
    error,
    refetch: refreshPermissions
  } = useQuery({
    queryKey: ['permissions', user?.id],
    queryFn: async () => {
      if (!token) {
        console.warn('usePermissions: No authentication token available')
        return null
      }
      if (!user) {
        console.warn('usePermissions: No user available')
        return null
      }

      try {
        return await fetchUserPermissions(token)
      } catch (error: any) {
        console.warn('usePermissions: Failed to fetch permissions:', error.message || error)

        // Return null instead of throwing to prevent breaking the UI
        // The hook will fall back to authPermissions
        return null
      }
    },
    enabled: !!user && !!token,  // Removed isValidSession dependency to prevent race conditions
    staleTime: parseInt(import.meta.env.VITE_PERMISSIONS_CACHE_TTL) || 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors, let the refresh token logic handle it
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 1 // Reduce retry attempts
    },
    onError: (error) => {
      console.warn('usePermissions: Permission loading failed, falling back to auth permissions:', error)
    }
  })

  // Use cached permissions from auth context if query fails or is loading
  // This prevents permission checks from failing during page transitions
  const effectivePermissions = permissions || authPermissions

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!effectivePermissions) return false

    // Split permission like 'leads.create' into resource and action
    const [resource, action] = permission.split('.')

    // Check computed permissions
    const permissionMap: Record<string, boolean> = {
      'users.create': effectivePermissions.canCreateUsers,
      'users.edit': effectivePermissions.canEditUsers,
      'users.delete': effectivePermissions.canDeleteUsers,
      'leads.view': effectivePermissions.canViewAllLeads,
      'leads.create': effectivePermissions.canCreateLeads,
      'leads.edit': effectivePermissions.canEditLeads,
      'leads.delete': effectivePermissions.canDeleteLeads,
      'campaigns.manage': effectivePermissions.canManageCampaigns,
      'reports.view': effectivePermissions.canViewReports,
      'admin.access': effectivePermissions.canAccessAdmin,
      'sessions.manage': effectivePermissions.canManageSessions,
      'audit.view': effectivePermissions.canViewAuditLogs,
    }

    return permissionMap[permission] || false
  }

  /**
   * Check if user has one of multiple roles
   */
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  /**
   * Check if user has any of multiple permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  /**
   * Check if user has all of multiple permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  return {
    // Permission data
    permissions: effectivePermissions,
    isLoading,
    error,

    // Permission checking functions
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,

    // Role convenience checks
    isAdmin: hasRole('admin'),
    isCompanyAdmin: hasRole('empresa_admin'),
    isUser: hasRole('empresa_user'),
    isApiUser: hasRole('api_user'),

    // Common permission checks
    canCreateUsers: hasPermission('users.create'),
    canEditUsers: hasPermission('users.edit'),
    canDeleteUsers: hasPermission('users.delete'),
    canViewLeads: hasPermission('leads.view'),
    canCreateLeads: hasPermission('leads.create'),
    canManageCampaigns: hasPermission('campaigns.manage'),
    canAccessAdmin: hasPermission('admin.access'),
    canManageSessions: hasPermission('sessions.manage'),
    canViewAuditLogs: hasPermission('audit.view'),

    // Organization scoping
    scopeToOrganization: effectivePermissions?.scopeToOrganization || false,

    // Refresh function
    refreshPermissions: async () => {
      try {
        await refreshPermissions()
      } catch (error) {
        handlePermissionError(error as Error, 'refresh permissions')
      }
    }
  }
}

/**
 * Hook to check a specific permission with loading state
 * Useful for conditional rendering with loading indicators
 */
export function usePermissionCheck(permission: string) {
  const { hasPermission, isLoading, error } = usePermissions()

  return {
    hasPermission: hasPermission(permission),
    isLoading,
    error
  }
}

/**
 * Hook to check multiple permissions at once
 */
export function usePermissionsCheck(permissions: string[]) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading, error } = usePermissions()

  return {
    hasAny: hasAnyPermission(permissions),
    hasAll: hasAllPermissions(permissions),
    individual: permissions.reduce((acc, permission) => {
      acc[permission] = hasPermission(permission)
      return acc
    }, {} as Record<string, boolean>),
    isLoading,
    error
  }
}