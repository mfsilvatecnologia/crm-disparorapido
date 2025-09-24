// SessionManagement Component - Admin interface for managing user sessions
import React, { useState } from 'react'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useSessions } from '@/shared/hooks/useSessions'
import { useAuth } from '@/shared/contexts/AuthContext'
import { terminateSession } from '@/shared/services/sessions'

export function SessionManagement() {
  const { canManageSessions } = usePermissions()
  const { sessions, isLoading, refetch } = useSessions()
  const { token } = useAuth()
  const [terminating, setTerminating] = useState<string | null>(null)

  const handleTerminateSession = async (sessionId: string) => {
    if (!token || !canManageSessions) return

    setTerminating(sessionId)
    try {
      await terminateSession(token, sessionId)
      refetch()
    } catch (error) {
      console.error('Failed to terminate session:', error)
    } finally {
      setTerminating(null)
    }
  }

  if (!canManageSessions) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg mb-2">🚫</div>
        <p className="text-gray-600">Sem permissão para gerenciar sessões</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Gerenciamento de Sessões</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Sessões</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Atualizar
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dispositivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Atividade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sessions?.map((session) => (
              <tr key={session.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {session.usuario?.nome || session.usuario?.email}
                  </div>
                  <div className="text-sm text-gray-500">{session.usuario?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{session.device_info}</div>
                  <div className="text-sm text-gray-500">IP: {session.ip_address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(session.last_activity).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    session.ativo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {session.ativo ? 'Ativa' : 'Expirada'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {session.ativo && (
                    <button
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminating === session.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {terminating === session.id ? 'Terminando...' : 'Terminar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!sessions?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma sessão encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}