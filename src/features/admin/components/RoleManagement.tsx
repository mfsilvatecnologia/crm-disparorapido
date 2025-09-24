// RoleManagement Component - Admin interface for managing roles
import React from 'react'
import { useRoles } from '@/shared/hooks/useRoles'
import { usePermissions } from '@/shared/hooks/usePermissions'

export function RoleManagement() {
  const { roles, isLoading, canManageRoles } = useRoles()
  const { isAdmin } = usePermissions()

  if (!canManageRoles) {
    return <div className="p-4 text-gray-600">Sem permissão para gerenciar roles</div>
  }

  if (isLoading) {
    return <div className="p-4">Carregando roles...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Gerenciamento de Roles</h2>
      <div className="grid gap-4">
        {roles.map(role => (
          <div key={role.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{role.nome}</h3>
            <p className="text-gray-600">{role.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  )
}