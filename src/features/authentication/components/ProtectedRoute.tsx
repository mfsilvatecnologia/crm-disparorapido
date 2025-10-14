// ProtectedRoute Component
// Route-level permission and authentication protection

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
// COMENTADO: Sistema de permissões será implementado no backend
// import { usePermissions } from '../hooks/usePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermission?: string
  requiredRole?: string | string[]
  fallbackPath?: string
  requireValidSession?: boolean
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  requiredRole,
  fallbackPath = '/login',
  requireValidSession = true
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  // COMENTADO: Sistema de permissões será implementado no backend
  // const { hasPermission, hasRole, isLoading: permLoading, permissions } = usePermissions()
  const location = useLocation()
  
  // TEMPORÁRIO: Permitir acesso até backend implementar permissões
  const hasPermission = (_permission: string) => true
  const hasRole = (_role: string | string[]) => true
  const permLoading = false
  const permissions = React.useMemo(() => ({}), [])

  // Debug logging for admin route access
  React.useEffect(() => {
    if (location.pathname.includes('/admin')) {
      console.log('ProtectedRoute: Admin route access check', {
        pathname: location.pathname,
        isAuthenticated,
        user: user ? { id: user.id, role: user.role, email: user.email } : null,
        // token: token ? 'present' : 'missing', // COMENTADO: token removido do AuthContext
        permissions: permissions ? Object.keys(permissions).filter(key => permissions[key as keyof typeof permissions]) : null,
        authLoading,
        permLoading,
        requiredPermission,
        requiredRole
      });
    }
  }, [location.pathname, isAuthenticated, user, permissions, authLoading, permLoading, requiredPermission, requiredRole]);

  // Show loading state while checking authentication and permissions
  if (authLoading || permLoading) {
    console.log('ProtectedRoute: Loading state', { authLoading, permLoading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    console.log('ProtectedRoute: Authentication required but user not authenticated, redirecting to', fallbackPath);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Session validation is handled by AuthContext
  // No need for separate session check here

  // Check specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('ProtectedRoute: Permission check failed', {
      requiredPermission,
      userPermissions: permissions,
      hasPermission: hasPermission(requiredPermission)
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Permissão necessária: <code className="bg-gray-100 px-2 py-1 rounded">{requiredPermission}</code>
          </p>
        </div>
      </div>
    )
  }

  // Check role-based access requirement
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('ProtectedRoute: Role check failed', {
      requiredRole,
      userRole: user?.role,
      hasRole: hasRole(requiredRole)
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="text-orange-500 text-6xl mb-4">👤</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">
            Esta página é restrita ao seu nível de acesso.
          </p>
          <p className="text-sm text-gray-500">
            Role necessária: <code className="bg-gray-100 px-2 py-1 rounded">
              {Array.isArray(requiredRole) ? requiredRole.join(' ou ') : requiredRole}
            </code>
          </p>
        </div>
      </div>
    )
  }

  console.log('ProtectedRoute: All checks passed, rendering children');
  return <>{children}</>
}

// Convenience components for common protection patterns
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  )
}

export function CompanyAdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={['admin', 'empresa_admin']}>
      {children}
    </ProtectedRoute>
  )
}

export function UserManagementRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredPermission="users.create">
      {children}
    </ProtectedRoute>
  )
}