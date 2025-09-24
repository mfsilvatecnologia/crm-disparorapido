// useRoles Hook
// Manages role data with React Query caching

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { fetchRoles, createRole } from "@/shared/services/roles"
import type { Role, PermissionSet } from '../types/auth'

export function useRoles() {
  const { token, hasPermission } = useAuth()

  const {
    data: rolesResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return await fetchRoles(token)
    },
    enabled: !!token && hasPermission('admin.access'),
    staleTime: 10 * 60 * 1000, // 10 minutes - roles don't change often
  })

  const roles = rolesResponse?.data || []

  const createNewRole = async (roleData: { nome: string; descricao: string; permissoes: PermissionSet }) => {
    if (!token) {
      throw new Error('No authentication token available')
    }

    const result = await createRole(token, roleData)

    // Refresh roles list after creation
    await refetch()

    return result
  }

  return {
    roles,
    isLoading,
    error,
    createRole: createNewRole,
    refreshRoles: refetch,
    canManageRoles: hasPermission('admin.access')
  }
}