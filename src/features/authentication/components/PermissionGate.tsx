// PermissionGate Component
// Conditionally renders children based on permissions or roles

import React from 'react'
import { usePermissions } from '@/features/authentication'

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
  const { hasPermission, hasRole, isLoading } = usePermissions()

  // Show loading state
  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
  }

  // Check permission-based access
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission]

    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p))

    if (!hasAccess) {
      return <>{fallback}</>
    }
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
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