// UserManagement Component
// Admin interface for managing users and their roles

import React, { useState } from 'react'
// COMENTADO: Sistema de permissões será implementado no backend
// import { usePermissions } from '@/features/authentication'
import { RoleSelector } from '@/features/authentication/components/RoleSelector'
import { updateUserRole } from "@/features/authentication/services/users"
import { useAuth } from '@/shared/contexts/AuthContext'

interface User {
  id: string
  email: string
  nome?: string
  role: string
  ativo: boolean
  empresa_id: string
}

interface UserManagementProps {
  users?: User[]
  onUserUpdate?: (userId: string, newRole: string) => void
}

export function UserManagement({
  users = [],
  onUserUpdate
}: UserManagementProps) {
  // COMENTADO: Sistema de permissões será implementado no backend
  // const { canCreateUsers, canEditUsers, canDeleteUsers } = usePermissions()
  
  // TEMPORÁRIO: Permitir todas as ações até backend implementar permissões
  const canCreateUsers = true
  const canEditUsers = true
  const canDeleteUsers = true
  
  const { user } = useAuth() // token não está mais disponível no AuthContext
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    if (!user || !canEditUsers) return

    setLoading(userId)
    try {
      // TODO: Corrigir quando token voltar ao AuthContext
      await updateUserRole('temp-token', userId, {
        role: newRole,
        reason: 'Role updated via admin interface'
      })

      onUserUpdate?.(userId, newRole)
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user role:', error)
      // TODO: Show error message to user
    } finally {
      setLoading(null)
    }
  }

  if (!canCreateUsers && !canEditUsers) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg mb-2">🚫</div>
        <p className="text-gray-600">
          Você não tem permissão para gerenciar usuários.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Gerenciamento de Usuários
        </h2>
        {canCreateUsers && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Adicionar Usuário
          </button>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.nome || user.email}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <div className="flex space-x-2">
                      <RoleSelector
                        selectedRole={user.role}
                        onRoleChange={(newRole) => handleRoleUpdate(user.id, newRole)}
                        disabled={loading === user.id}
                        className="w-48"
                      />
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading === user.id}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{user.role}</span>
                      {canEditUsers && (
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.ativo
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {canEditUsers && (
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Editar
                      </button>
                    )}
                    {canDeleteUsers && (
                      <button className="text-red-600 hover:text-red-900">
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}