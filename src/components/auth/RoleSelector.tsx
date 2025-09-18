// RoleSelector Component
// Dropdown component for selecting user roles with permission validation

import React from 'react'
import { useRoles } from '../../hooks/useRoles'
import { usePermissions } from '../../hooks/usePermissions'

interface RoleSelectorProps {
  selectedRole?: string
  onRoleChange: (role: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function RoleSelector({
  selectedRole,
  onRoleChange,
  disabled = false,
  className = '',
  placeholder = 'Selecione uma role'
}: RoleSelectorProps) {
  const { roles, isLoading: rolesLoading } = useRoles()
  const { isAdmin, isCompanyAdmin } = usePermissions()

  // Filter roles based on current user's permissions
  const availableRoles = roles.filter(role => {
    // Admin can assign any role
    if (isAdmin) return true

    // Company admin can assign company roles but not admin
    if (isCompanyAdmin) {
      return ['empresa_admin', 'empresa_user', 'api_user'].includes(role.nome)
    }

    // Regular users cannot assign roles
    return false
  })

  if (rolesLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-10 rounded-md ${className}`} />
    )
  }

  return (
    <select
      value={selectedRole || ''}
      onChange={(e) => onRoleChange(e.target.value)}
      disabled={disabled || availableRoles.length === 0}
      className={`
        block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <option value="">{placeholder}</option>
      {availableRoles.map(role => (
        <option key={role.id} value={role.nome}>
          {role.descricao} ({role.nome})
        </option>
      ))}
    </select>
  )
}

// Simplified role selector for common use cases
export function SimpleRoleSelector({
  selectedRole,
  onRoleChange,
  disabled = false
}: {
  selectedRole?: string
  onRoleChange: (role: string) => void
  disabled?: boolean
}) {
  const { isAdmin, isCompanyAdmin } = usePermissions()

  // Define available roles based on permissions
  const availableRoles = React.useMemo(() => {
    if (isAdmin) {
      return [
        { value: 'admin', label: 'Administrador do Sistema' },
        { value: 'empresa_admin', label: 'Administrador da Empresa' },
        { value: 'empresa_user', label: 'Usuário da Empresa' },
        { value: 'api_user', label: 'Usuário API' },
      ]
    }

    if (isCompanyAdmin) {
      return [
        { value: 'empresa_admin', label: 'Administrador da Empresa' },
        { value: 'empresa_user', label: 'Usuário da Empresa' },
        { value: 'api_user', label: 'Usuário API' },
      ]
    }

    return []
  }, [isAdmin, isCompanyAdmin])

  if (availableRoles.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic">
        Sem permissão para gerenciar roles
      </div>
    )
  }

  return (
    <select
      value={selectedRole || ''}
      onChange={(e) => onRoleChange(e.target.value)}
      disabled={disabled}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
    >
      <option value="">Selecione uma role</option>
      {availableRoles.map(role => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </select>
  )
}