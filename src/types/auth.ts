// Authentication and Authorization Types
// Based on API-first architecture with REST endpoints from swagger.json

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

export interface User {
  id: string
  email: string
  nome?: string
  telefone?: string
  ativo: boolean
  role: string
  empresa_id: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Organization {
  id: string
  nome: string
  cnpj: string
  email: string
  saldo_creditos: number
  api_key: string
  segmento?: string
  recursos_interesse?: string[]
  created_at: string
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
  canManageSessions: boolean
  canViewAuditLogs: boolean
  scopeToOrganization: boolean
}

// Session Management Types (Integration with spec 003)
export interface UserSession {
  id: string
  user_id: string
  empresa_id: string
  device_id: string
  refresh_token_hash: string
  device_fingerprint: string
  ip_address: string
  user_agent: string
  client_type: ClientType
  status: SessionStatus
  created_at: Date
  last_activity_at: Date
  expires_at: Date
  metadata: object
}

export enum ClientType {
  WEB = 'web',
  EXTENSION = 'extension'
}

export enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPICIOUS = 'suspicious'
}

export interface SessionContext {
  session: UserSession | null
  deviceId: string
  fingerprint: string
  isValidSession: boolean
}

export interface EmpresaSessionLimits {
  empresa_id: string
  max_concurrent_sessions: number
  current_active_sessions: number
  enforcement_mode: EnforcementMode
  created_at: Date
  updated_at: Date
  updated_by: string
}

export enum EnforcementMode {
  BLOCK = 'block',
  WARN = 'warn',
  ALLOW_WITH_AUDIT = 'allow_with_audit'
}

// Audit Log Types
export interface AuditLog {
  id: string
  user_id: string
  session_id?: string
  action: string
  resource: string
  resource_id?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
}

export interface SessionAuditLog {
  id: string
  session_id: string
  user_id: string
  empresa_id: string
  action: SessionAction
  details: object
  ip_address: string
  user_agent: string
  success: boolean
  error_message?: string
  created_at: Date
}

export enum SessionAction {
  LOGIN = 'login',
  REFRESH = 'refresh',
  LOGOUT = 'logout',
  EXPIRED = 'expired',
  FORCE_LOGOUT = 'force_logout',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DEVICE_CHANGE = 'device_change',
  IP_CHANGE = 'ip_change',
  PERMISSION_DENIED = 'permission_denied',
  ROLE_ESCALATION = 'role_escalation'
}

// Permission Context
export interface PermissionContext {
  user: User
  role: Role
  organization: Organization
  session: UserSession | null
  permissions: ComputedPermissions
}

// API Response Types
export interface PermissionsResponse {
  success: boolean
  data: {
    user: User
    role: Role
    permissions: ComputedPermissions
    organization: Organization
  }
  cached: boolean
  expiresIn: number
}

export interface PermissionValidationRequest {
  permission: string
  resource?: string
}

export interface PermissionValidationResponse {
  success: boolean
  data: {
    hasPermission: boolean
    permission: string
    reason?: string
  }
}

export interface RoleUpdateRequest {
  role: string
  reason?: string
}

export interface UserRoleUpdateResponse {
  success: boolean
  data: {
    user: User
    previousRole: string
    newRole: string
    updatedAt: string
  }
}

export interface AuditLogRequest {
  action: string
  resource: string
  resource_id?: string
  session_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export interface AuditLogsResponse {
  success: boolean
  data: {
    logs: AuditLog[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// Session Management Response Types
export interface CompanySessionsResponse {
  success: boolean
  data: {
    sessions: SessionInfo[]
    total: number
    active_sessions: number
    session_limit: number
    current_usage_percentage: number
  }
}

export interface SessionInfo {
  session_id: string
  user_id: string
  user_name: string
  user_email: string
  device_id: string
  client_type: ClientType
  status: SessionStatus
  ip_address: string
  user_agent: string
  created_at: string
  last_activity_at: string
  expires_at: string
  is_current_session: boolean
}

export interface TerminateSessionRequest {
  reason: string
  notify_user?: boolean
}

// Frontend State Management Types
export interface AuthContextValue {
  user: User | null
  permissions: ComputedPermissions | null
  isAuthenticated: boolean
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  hasRole: (role: string | string[]) => boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshPermissions: () => Promise<void>
}

export interface LoginCredentials {
  email: string
  password: string
  cnpj?: string
  empresa_id?: string
  device_id?: string
  device_fingerprint?: string
  client_type?: ClientType
}

// Permission Cache Structure
export interface PermissionCache {
  userId: string
  permissions: ComputedPermissions
  cachedAt: number
  expiresAt: number
  version: string
}

// Role Assignment Validation
export interface RoleAssignmentRules {
  admin: {
    canAssign: string[]
    scope: 'global'
  }
  empresa_admin: {
    canAssign: string[]
    scope: 'organization'
    restrictions: string[]
  }
  empresa_user: {
    canAssign: string[]
    scope: 'none'
  }
  api_user: {
    canAssign: string[]
    scope: 'none'
  }
}

// Data Access Rules
export interface DataAccessRules {
  leads: Record<string, string>
  users: Record<string, string>
  campaigns: Record<string, string>
}

// State Transitions
export interface RoleTransition {
  from: string
  to: string
  allowedBy: string[]
  validations: string[]
  effects: string[]
}

export interface SessionState {
  user: User
  permissions: ComputedPermissions
  cacheExpiry: number
  lastValidation: number
  isStale: boolean
}