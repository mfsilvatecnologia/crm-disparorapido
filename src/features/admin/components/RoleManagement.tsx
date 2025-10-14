// RoleManagement Component - Admin interface for managing roles
import React from 'react'
import { useRoles } from '@/features/authentication'
// COMENTADO: Sistema de permissões será implementado no backend
// import { usePermissions } from '@/features/authentication'

export function RoleManagement() {
  const { roles, isLoading, canManageRoles } = useRoles()
  // COMENTADO: Sistema de permissões será implementado no backend
  // const { isAdmin } = usePermissions()
  
  // TEMPORÁRIO: Permitir acesso até backend implementar permissões
  const isAdmin = true

  if (!canManageRoles) {
    return <div className="p-4 text-gray-600">Carregando permissões...</div>
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