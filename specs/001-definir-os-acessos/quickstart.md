# Quickstart: Sistema de Controle de Acesso e Permissões

**Implementation Quick Start Guide**
**Data**: 2025-09-15

## Development Setup

### 1. Install Dependencies
```bash
# Core dependencies
npm install @tanstack/react-query jwt-decode react-hot-toast

# Development dependencies
npm install --save-dev @types/jest @testing-library/react @testing-library/jest-dom
```

### 2. Environment Configuration
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_AUTH_TOKEN_KEY=leadsrapido_auth_token
VITE_REFRESH_TOKEN_KEY=leadsrapido_refresh_token
VITE_DEVICE_ID_KEY=leadsrapido_device_id
VITE_PERMISSIONS_CACHE_TTL=300000  # 5 minutes
VITE_SESSION_REFRESH_INTERVAL=60000  # 1 minute
```

### 3. Device ID Management (Integration with spec 003)
```typescript
// src/lib/device.ts
export function getOrCreateDeviceId(): string {
  const key = import.meta.env.VITE_DEVICE_ID_KEY || 'leadsrapido_device_id'
  let deviceId = localStorage.getItem(key)

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem(key, deviceId)
  }

  return deviceId
}

export function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.fillText('Device fingerprint', 2, 2)

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')

  return btoa(fingerprint).slice(0, 32)
}

// Expose for Chrome extension access
declare global {
  interface Window {
    getDeviceId: () => string
  }
}

window.getDeviceId = getOrCreateDeviceId
```

## Core Implementation Components

### 1. Permission Types (src/types/auth.ts)
```typescript
export interface Role {
  id: string
  nome: string
  descricao: string
  permissoes: PermissionSet
  created_at: string
}

export interface PermissionSet {
  all?: boolean
  leads?: 'all' | 'read' | 'api'
  usuarios?: 'manage' | 'read'
  campanhas?: 'all' | 'read'
  webhooks?: 'receive'
  admin?: 'all'
  dashboard?: 'all' | 'read'
  search_terms?: 'all' | 'read'
}

export interface ComputedPermissions {
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean
  canViewAllLeads: boolean
  canCreateLeads: boolean
  canEditLeads: boolean
  canDeleteLeads: boolean
  canManageCampaigns: boolean
  canViewReports: boolean
  canAccessAdmin: boolean
  canManageSessions: boolean     // New: can manage user sessions
  canViewAuditLogs: boolean      // New: can view audit logs
  scopeToOrganization: boolean
}

// Integration with session types from spec 003
export interface UserSession {
  id: string
  user_id: string
  empresa_id: string
  device_id: string
  client_type: 'web' | 'extension'
  status: 'active' | 'expired' | 'revoked' | 'suspicious'
  created_at: Date
  last_activity_at: Date
  expires_at: Date
  ip_address: string
  user_agent: string
}

export interface SessionContext {
  session: UserSession | null
  deviceId: string
  fingerprint: string
  isValidSession: boolean
}
```

### 2. Enhanced Permission Hook (src/hooks/usePermissions.ts)
```typescript
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useSession } from '../contexts/SessionContext'
import { getOrCreateDeviceId } from '../lib/device'

export function usePermissions() {
  const { user, token } = useAuth()
  const { session, isValidSession } = useSession()

  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['permissions', user?.id, session?.id],
    queryFn: () => fetchUserPermissions(token, getOrCreateDeviceId()),
    enabled: !!user && !!token && isValidSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on permission/session errors
      if (error?.message?.includes('PERMISSION_DENIED') ||
          error?.message?.includes('INVALID_SESSION')) {
        return false
      }
      return failureCount < 2
    }
  })

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false

    // Split permission like 'leads.create' into resource and action
    const [resource, action] = permission.split('.')

    // Check computed permissions
    const permissionMap = {
      'users.create': permissions.canCreateUsers,
      'users.edit': permissions.canEditUsers,
      'users.delete': permissions.canDeleteUsers,
      'leads.view': permissions.canViewAllLeads,
      'leads.create': permissions.canCreateLeads,
      'leads.edit': permissions.canEditLeads,
      'leads.delete': permissions.canDeleteLeads,
      'campaigns.manage': permissions.canManageCampaigns,
      'reports.view': permissions.canViewReports,
      'admin.access': permissions.canAccessAdmin,
      'sessions.manage': permissions.canManageSessions,
      'audit.view': permissions.canViewAuditLogs,
    }

    return permissionMap[permission] || false
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    return user.role === role
  }

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasRole,
    isAdmin: hasRole('admin'),
    isCompanyAdmin: hasRole('empresa_admin'),
    isUser: hasRole('empresa_user'),
    isApiUser: hasRole('api_user')
  }
}
```

### 3. Permission Gate Component (src/components/auth/PermissionGate.tsx)
```typescript
import React from 'react'
import { usePermissions } from '../../hooks/usePermissions'

interface PermissionGateProps {
  permission?: string
  role?: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  role,
  fallback = null,
  children
}: PermissionGateProps) {
  const { hasPermission, hasRole, isLoading } = usePermissions()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-24 rounded" />
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Check role-based access
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### 4. Session Context (src/contexts/SessionContext.tsx)
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserSession, SessionContext as SessionContextType } from '../types/auth'
import { getOrCreateDeviceId, getDeviceFingerprint } from '../lib/device'

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [deviceId] = useState(getOrCreateDeviceId())
  const [fingerprint] = useState(getDeviceFingerprint())
  const queryClient = useQueryClient()

  // Query current session information
  const { data: session, isLoading } = useQuery({
    queryKey: ['session', deviceId],
    queryFn: () => getCurrentSession(deviceId),
    enabled: !!deviceId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: false
  })

  const isValidSession = session?.status === 'active' &&
                        session?.device_id === deviceId &&
                        new Date(session.expires_at) > new Date()

  // Auto-refresh session data
  useEffect(() => {
    if (!isValidSession && session) {
      // Session invalid, clear related caches
      queryClient.invalidateQueries(['permissions'])
      queryClient.invalidateQueries(['user'])
    }
  }, [isValidSession, session, queryClient])

  const value: SessionContextType = {
    session,
    deviceId,
    fingerprint,
    isValidSession
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

async function getCurrentSession(deviceId: string): Promise<UserSession | null> {
  const token = localStorage.getItem('auth_token')
  if (!token) return null

  try {
    const response = await fetch('/api/v1/sessions/active', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Device-Id': deviceId,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    const currentSession = data.data.sessions.find((s: UserSession) =>
      s.device_id === deviceId && s.status === 'active'
    )

    return currentSession || null
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return null
  }
}
```

### 5. Updated Auth Context (src/contexts/AuthContext.tsx)
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from './SessionContext'
import { getOrCreateDeviceId, getDeviceFingerprint } from '../lib/device'
import type { User, ComputedPermissions } from '../types/auth'

interface LoginCredentials {
  email: string
  password: string
  cnpj?: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  refreshToken: string | null
  permissions: ComputedPermissions | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('refresh_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser && savedRefreshToken) {
      setToken(savedToken)
      setRefreshToken(savedRefreshToken)
      setUser(JSON.parse(savedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const deviceId = getOrCreateDeviceId()
    const fingerprint = getDeviceFingerprint()

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...credentials,
        device_id: deviceId,
        device_fingerprint: fingerprint,
        client_type: 'web'
      }),
    })

    const data = await response.json()

    if (data.success) {
      setToken(data.data.access_token)
      setRefreshToken(data.data.refresh_token)
      setUser(data.data.user)

      localStorage.setItem('auth_token', data.data.access_token)
      localStorage.setItem('refresh_token', data.data.refresh_token)
      localStorage.setItem('auth_user', JSON.stringify(data.data.user))
    } else {
      throw new Error(data.error?.message || 'Login failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRefreshToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    queryClient.clear()
  }

  const refreshPermissions = async () => {
    if (token) {
      await queryClient.invalidateQueries(['permissions'])
    }
  }

  const value: AuthContextValue = {
    user,
    token,
    refreshToken,
    permissions: null, // Will be loaded via usePermissions hook
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshPermissions,
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 5. Protected Route Component (src/components/auth/ProtectedRoute.tsx)
```typescript
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../hooks/usePermissions'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredPermission?: string
  requiredRole?: string | string[]
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  requiredRole,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { hasPermission, hasRole, isLoading: permLoading } = usePermissions()
  const location = useLocation()

  if (authLoading || permLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Esta página é restrita ao seu nível de acesso.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
```

## Usage Examples

### 1. Protecting Components with Permissions
```typescript
// In any component
import { PermissionGate } from '../components/auth/PermissionGate'

function LeadsPage() {
  return (
    <div>
      <h1>Leads</h1>

      <PermissionGate permission="leads.create">
        <button className="btn-primary">Criar Lead</button>
      </PermissionGate>

      <PermissionGate
        role={['admin', 'empresa_admin']}
        fallback={<p>Acesso restrito</p>}
      >
        <AdminControls />
      </PermissionGate>
    </div>
  )
}
```

### 2. Protecting Routes
```typescript
// In App.tsx or Router setup
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/leads" element={
        <ProtectedRoute requiredPermission="leads.view">
          <LeadsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}
```

### 3. Conditional Navigation
```typescript
// In navigation component
import { usePermissions } from '../hooks/usePermissions'

function Sidebar() {
  const { hasPermission, isAdmin } = usePermissions()

  return (
    <nav>
      <NavLink to="/dashboard">Dashboard</NavLink>

      {hasPermission('leads.view') && (
        <NavLink to="/leads">Leads</NavLink>
      )}

      {hasPermission('campaigns.manage') && (
        <NavLink to="/campaigns">Campanhas</NavLink>
      )}

      {isAdmin && (
        <NavLink to="/admin">Administração</NavLink>
      )}
    </nav>
  )
}
```

## API Integration

### 1. Enhanced API Integration (src/lib/api/permissions.ts)
```typescript
import { getOrCreateDeviceId } from '../device'

export async function fetchUserPermissions(token: string, deviceId?: string) {
  const response = await fetch('/api/v1/auth/permissions', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': deviceId || getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch permissions')
  }

  const data = await response.json()
  return data.data.permissions
}

export async function validatePermission(token: string, permission: string) {
  const response = await fetch('/api/v1/auth/permissions/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ permission }),
  })

  const data = await response.json()
  return data.data.hasPermission
}

// Session management functions
export async function fetchCompanySessions(token: string) {
  const response = await fetch('/api/v1/admin/sessions', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch sessions')
  }

  const data = await response.json()
  return data.data
}

export async function terminateSession(token: string, sessionId: string, reason: string) {
  const response = await fetch(`/api/v1/admin/sessions/${sessionId}/terminate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason, notify_user: true }),
  })

  if (!response.ok) {
    throw new Error('Failed to terminate session')
  }

  return await response.json()
}

export async function fetchAuditLogs(token: string, filters = {}) {
  const params = new URLSearchParams(filters)
  const response = await fetch(`/api/v1/admin/audit-logs?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Device-Id': getOrCreateDeviceId(),
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch audit logs')
  }

  const data = await response.json()
  return data.data
}
```

### 2. Error Handling and Logging
```typescript
// In your API client
import toast from 'react-hot-toast'

export function handlePermissionError(error: Error, permission: string) {
  console.error(`Permission denied for ${permission}:`, error)

  toast.error('Acesso negado: você não tem permissão para esta ação')

  // Log to audit system
  logAuditEvent({
    action: 'access_denied',
    resource: permission,
    details: { error: error.message }
  })
}
```

## Testing Strategy

### 1. Unit Tests for Permission Logic
```typescript
// __tests__/hooks/usePermissions.test.ts
import { renderHook } from '@testing-library/react'
import { usePermissions } from '../../src/hooks/usePermissions'

describe('usePermissions', () => {
  it('should grant admin access to all permissions', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createMockAuthProvider({ role: 'admin' })
    })

    expect(result.current.hasPermission('users.create')).toBe(true)
    expect(result.current.hasPermission('leads.delete')).toBe(true)
    expect(result.current.isAdmin).toBe(true)
  })

  it('should restrict empresa_user permissions', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createMockAuthProvider({ role: 'empresa_user' })
    })

    expect(result.current.hasPermission('users.create')).toBe(false)
    expect(result.current.hasPermission('leads.view')).toBe(false)
    expect(result.current.isUser).toBe(true)
  })
})
```

### 2. Integration Tests for Components
```typescript
// __tests__/components/PermissionGate.test.tsx
import { render, screen } from '@testing-library/react'
import { PermissionGate } from '../../src/components/auth/PermissionGate'

describe('PermissionGate', () => {
  it('should render children when permission is granted', () => {
    render(
      <MockAuthProvider permissions={{ canCreateUsers: true }}>
        <PermissionGate permission="users.create">
          <button>Create User</button>
        </PermissionGate>
      </MockAuthProvider>
    )

    expect(screen.getByText('Create User')).toBeInTheDocument()
  })

  it('should render fallback when permission is denied', () => {
    render(
      <MockAuthProvider permissions={{ canCreateUsers: false }}>
        <PermissionGate
          permission="users.create"
          fallback={<div>Access Denied</div>}
        >
          <button>Create User</button>
        </PermissionGate>
      </MockAuthProvider>
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Create User')).not.toBeInTheDocument()
  })
})
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API endpoints deployed and tested
- [ ] Database migrations applied
- [ ] Cache configuration verified

### Post-deployment
- [ ] Permissions loading correctly
- [ ] Role-based navigation working
- [ ] Audit logs being created
- [ ] Performance acceptable (<200ms permission checks)
- [ ] Error handling working properly

### Rollback Plan
- [ ] Feature flags to disable new permission system
- [ ] Database rollback scripts prepared
- [ ] Monitoring for permission-related errors
- [ ] Support team notified of changes

---
**Quickstart Guide Complete** ✓ - Ready for implementation