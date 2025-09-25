// AuditLogViewer Component - Admin interface for viewing audit logs
import React, { useState, useMemo } from 'react'
import { useAudit } from '@/features/admin'

const ACTION_TYPES = [
  { value: '', label: 'Todas as ações' },
  { value: 'CREATE', label: 'Criar' },
  { value: 'UPDATE', label: 'Atualizar' },
  { value: 'DELETE', label: 'Deletar' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'PERMISSION_CHANGE', label: 'Mudança de Permissão' },
]

export function AuditLogViewer() {
  const { auditLogs, isLoading, canViewAuditLogs } = useAudit()
  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 20

  const filteredLogs = useMemo(() => {
    if (!auditLogs) return []

    return auditLogs.filter(log => {
      const actionMatch = !filterAction || log.action === filterAction
      const userMatch = !filterUser ||
        log.usuario?.nome?.toLowerCase().includes(filterUser.toLowerCase()) ||
        log.usuario?.email?.toLowerCase().includes(filterUser.toLowerCase())

      return actionMatch && userMatch
    })
  }, [auditLogs, filterAction, filterUser])

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const startIndex = (currentPage - 1) * logsPerPage
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage)

  if (!canViewAuditLogs) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg mb-2">🚫</div>
        <p className="text-gray-600">Sem permissão para visualizar logs de auditoria</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Logs de Auditoria</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const getActionColor = (action: string) => {
    const colors = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-gray-100 text-gray-800',
      PERMISSION_CHANGE: 'bg-orange-100 text-orange-800',
    }
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por ação
            </label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por usuário
            </label>
            <input
              type="text"
              value={filterUser}
              onChange={(e) => {
                setFilterUser(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Nome ou email do usuário..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-sm text-gray-600">
        Mostrando {paginatedLogs.length} de {filteredLogs.length} logs
      </div>

      {/* Logs list */}
      <div className="space-y-3">
        {paginatedLogs.map(log => (
          <div key={log.id} className="bg-white p-4 border rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="font-medium text-gray-900">{log.resource}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>
                  <strong>Usuário:</strong> {log.usuario?.nome || log.usuario?.email || 'Sistema'}
                </span>
                {log.ip_address && (
                  <span>
                    <strong>IP:</strong> {log.ip_address}
                  </span>
                )}
              </div>
            </div>

            {log.detalhes && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                <strong>Detalhes:</strong> {log.detalhes}
              </div>
            )}
          </div>
        ))}

        {paginatedLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {filteredLogs.length === 0 && (filterAction || filterUser)
              ? 'Nenhum log encontrado com os filtros aplicados'
              : 'Nenhum log de auditoria encontrado'
            }
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>

          <span className="px-4 py-2 text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}