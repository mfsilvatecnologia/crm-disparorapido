// PermissionGate Component
// Conditionally renders children based on permissions or roles
// COMENTADO: Sistema de permissões será implementado no backend

import React from 'react'
// COMENTADO: import { usePermissions } from '@/features/authentication'

interface PermissionGateProps {
  permission?: string
  role?: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
  requireAll?: boolean // If multiple permissions, require all (default: false = require any)
}

export function PermissionGate({
  permission,
  role,
  fallback = null,
  children,
  requireAll = false
}: PermissionGateProps) {
  // COMENTADO: Sistema de permissões será implementado no backend
  // const { hasPermission, hasRole, isLoading } = usePermissions()
  
  // TEMPORÁRIO: Sempre permitir acesso até backend implementar permissões
  const hasPermission = (_permission: string) => true
  const hasRole = (_role: string | string[]) => true
  const isLoading = false

  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
  }

  // TEMPORÁRIO: Sempre mostrar children (permissões desabilitadas)
  return <>{children}</>

  // TODO: Reativar quando backend implementar permissões
  // Check permission-based access
  // if (permission) {
  //   const permissions = Array.isArray(permission) ? permission : [permission]
  //
  //   const hasAccess = requireAll
  //     ? permissions.every(p => hasPermission(p))
  //     : permissions.some(p => hasPermission(p))
  //
  //   if (!hasAccess) {
  //     return <>{fallback}</>
  //   }
  // }
  //
  // // Check role-based access
  // if (role && !hasRole(role)) {
  //   return <>{fallback}</>
  // }
  //
  // return <>{children}</>
}

// Convenience components for common permission checks
export function AdminOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CompanyAdminOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <PermissionGate role={['admin', 'empresa_admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}