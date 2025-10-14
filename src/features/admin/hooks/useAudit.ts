// useAudit Hook - Admin audit logging functionality
// COMENTADO: Sistema de permissões será implementado no backend
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/shared/contexts/AuthContext'

interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  userId: string
  userName: string
  details: string
  ipAddress?: string
}

export function useAudit() {
  const { user } = useAuth()
  
  // TEMPORÁRIO: Permitir acesso a auditoria até backend implementar
  const hasPermission = true

  // TODO: Implementar busca real de logs quando backend estiver pronto
  const {
    data: auditLogs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      // Mock data para desenvolvimento
      return [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          action: 'LOGIN',
          userId: user?.id || 'unknown',
          userName: user?.email || 'Unknown User',
          details: 'Usuário fez login no sistema',
          ipAddress: '192.168.1.1'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          action: 'USER_UPDATE',
          userId: user?.id || 'unknown',
          userName: user?.email || 'Unknown User',
          details: 'Atualizou informações de outro usuário',
          ipAddress: '192.168.1.1'
        }
      ]
    },
    enabled: hasPermission && !!user
  })

  const logEvent = async (action: string, details: string) => {
    // TODO: Implementar logging real quando backend estiver pronto
    console.log('Audit log event:', { action, details, userId: user?.id })
    
    // Mock success
    return { success: true }
  }

  return {
    auditLogs,
    isLoading,
    error,
    refetch,
    logEvent,
    hasPermission,
    // Compatibility
    isLoggingEvent: false
  }
}

// TODO: Quando backend implementar auditoria:
// - Descomentar import usePermissions
// - Implementar API calls reais para buscar logs
// - Implementar logEvent com POST para backend
// - Adicionar filtros e paginação
// - Reativar validação de permissões