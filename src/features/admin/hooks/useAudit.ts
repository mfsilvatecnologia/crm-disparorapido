// useAudit Hook
// Manages audit log data and operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { usePermissions } from './usePermissions'
import { fetchAuditLogs, createAuditLog } from '../services/audit'
import type { AuditLogRequest } from '../types/auth'

interface AuditFilters {
  page?: number
  limit?: number
  action?: string
  userId?: string
  sessionId?: string
  from?: string
  to?: string
}

export function useAudit(filters: AuditFilters = {}) {
  const { token } = useAuth()
  const { hasPermission } = usePermissions()
  const queryClient = useQueryClient()

  const {
    data: auditResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return await fetchAuditLogs(token, filters)
    },
    enabled: !!token && hasPermission('audit.view'),
    staleTime: 30 * 1000, // 30 seconds - audit logs should be fresh
  })

  const auditLogs = auditResponse?.data.logs || []
  const pagination = auditResponse?.data.pagination

  const logEventMutation = useMutation({
    mutationFn: async (auditRequest: AuditLogRequest) => {
      if (!token) {
        throw new Error('No authentication token available')
      }
      return await createAuditLog(token, auditRequest)
    },
    onSuccess: () => {
      // Refresh audit logs after creating new entry
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    }
  })

  const logAuditEvent = async (auditRequest: AuditLogRequest) => {
    return logEventMutation.mutateAsync(auditRequest)
  }

  return {
    auditLogs,
    pagination,
    isLoading,
    error,
    logAuditEvent,
    refreshAuditLogs: refetch,
    canViewAuditLogs: hasPermission('audit.view'),
    isLoggingEvent: logEventMutation.isLoading
  }
}