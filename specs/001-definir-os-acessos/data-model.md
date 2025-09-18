# Data Model: Sistema de Controle de Acesso e Permissões

**Fase 1 - Data Model Design**
**Data**: 2025-09-15

## Core Entities

### Role Entity
```typescript
interface Role {
  id: string                    // UUID do role
  nome: string                  // Nome do role (admin, empresa_admin, etc.)
  descricao: string            // Descrição do role
  permissoes: PermissionSet    // Conjunto de permissões
  created_at: string           // ISO date string
}

interface PermissionSet {
  all?: boolean                // Permissão total (apenas admin)
  leads?: 'all' | 'read' | 'api'
  usuarios?: 'manage' | 'read'
  campanhas?: 'all' | 'read'
  webhooks?: 'receive'
  admin?: 'all'               // Acesso a funcionalidades administrativas
  dashboard?: 'all' | 'read'  // Acesso ao dashboard
  search_terms?: 'all' | 'read'
}
```

### User Entity (Extended)
```typescript
interface User {
  id: string
  email: string
  nome?: string
  telefone?: string
  ativo: boolean
  role: string                 // Foreign key to Role.nome
  empresa_id: string          // Foreign key to Organization
  created_at: string
  updated_at: string
  last_login?: string
}
```

### UserSession Entity (Integration with spec 003)
```typescript
interface UserSession {
  id: string                    // UUID primary key
  user_id: string              // FK para auth.users
  empresa_id: string           // FK para empresas
  device_id: string            // UUID único do dispositivo/cliente
  refresh_token_hash: string   // Hash do refresh token do Supabase
  device_fingerprint: string   // Hash de User-Agent + outros dados
  ip_address: string           // IP da conexão
  user_agent: string           // User agent completo
  client_type: ClientType      // 'web' | 'extension'
  status: SessionStatus        // 'active' | 'expired' | 'revoked' | 'suspicious'
  created_at: Date             // Timestamp de criação
  last_activity_at: Date       // Último acesso/atividade
  expires_at: Date             // Data de expiração calculada
  metadata: object             // Dados adicionais incluindo role information
}

enum ClientType {
  WEB = 'web',
  EXTENSION = 'extension'
}

enum SessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPICIOUS = 'suspicious'
}
```

### Organization Entity
```typescript
interface Organization {
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
```

### Permission Context (Enhanced with Session)
```typescript
interface PermissionContext {
  user: User
  role: Role
  organization: Organization
  session: UserSession           // Current session information
  permissions: ComputedPermissions
}

interface ComputedPermissions {
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
```

### EmpresaSessionLimits Entity (Integration with spec 003)
```typescript
interface EmpresaSessionLimits {
  empresa_id: string                    // FK para empresas (PK)
  max_concurrent_sessions: number       // Limite máximo de sessões simultâneas
  current_active_sessions: number       // Contador atual (calculado)
  enforcement_mode: EnforcementMode     // Como aplicar o limite
  created_at: Date                      // Quando foi configurado
  updated_at: Date                      // Última atualização
  updated_by: string                    // Usuário que fez a alteração
}

enum EnforcementMode {
  BLOCK = 'block',                       // Bloquear novos logins
  WARN = 'warn',                         // Permitir mas avisar
  ALLOW_WITH_AUDIT = 'allow_with_audit'  // Permitir e logar auditoria
}
```

### Audit Log Entity (Extended)
```typescript
interface AuditLog {
  id: string
  user_id: string
  session_id?: string         // Link to UserSession for context
  action: string              // 'access_denied', 'permission_granted', 'role_changed'
  resource: string            // 'users', 'leads', 'campaigns', 'sessions', etc.
  resource_id?: string        // ID do recurso acessado
  details: Record<string, any> // Contexto adicional incluindo role info
  ip_address?: string
  user_agent?: string
  timestamp: string
}

// Integration with SessionAuditLog from spec 003
interface SessionAuditLog {
  id: string
  session_id: string          // FK para user_sessions
  user_id: string             // FK para auth.users
  empresa_id: string          // FK para empresas
  action: SessionAction       // Session-specific actions
  details: object             // Including permission context
  ip_address: string
  user_agent: string
  success: boolean
  error_message?: string
  created_at: Date
}

enum SessionAction {
  LOGIN = 'login',
  REFRESH = 'refresh',
  LOGOUT = 'logout',
  EXPIRED = 'expired',
  FORCE_LOGOUT = 'force_logout',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DEVICE_CHANGE = 'device_change',
  IP_CHANGE = 'ip_change',
  PERMISSION_DENIED = 'permission_denied',    // New: permission-related
  ROLE_ESCALATION = 'role_escalation'        // New: privilege escalation attempt
}
```

## Permission Hierarchy

### Role Hierarchy (Order of privilege)
```
admin (system-wide control)
├── All permissions across all organizations
├── Can create/modify/delete any user
├── Can access system-wide reports
└── Can modify role permissions

empresa_admin (organization-scoped)
├── All permissions within their organization
├── Can create/modify/delete users in their org
├── Can access all leads/campaigns in their org
└── Cannot access other organizations

empresa_user (limited operations)
├── Read-only access to leads/campaigns
├── Can view assigned leads only
├── No user management capabilities
└── Limited dashboard access

api_user (external integrations)
├── API-only access to leads
├── Can receive webhooks
├── No UI access
└── Scoped to specific endpoints
```

### Permission Inheritance Rules (Enhanced)
```typescript
function computePermissions(user: User, role: Role, session?: UserSession): ComputedPermissions {
  const isAdmin = role.nome === 'admin'
  const isEmpresaAdmin = role.nome === 'empresa_admin'
  const isEmpresaUser = role.nome === 'empresa_user'
  const isApiUser = role.nome === 'api_user'

  // Session-based security checks
  const hasValidSession = session?.status === 'active'
  const isWebClient = session?.client_type === 'web'
  const isExtensionClient = session?.client_type === 'extension'

  return {
    // User management
    canCreateUsers: (isAdmin || isEmpresaAdmin) && hasValidSession,
    canEditUsers: (isAdmin || isEmpresaAdmin) && hasValidSession,
    canDeleteUsers: isAdmin && hasValidSession, // Only admin can delete

    // Leads management
    canViewAllLeads: (isAdmin || isEmpresaAdmin) && hasValidSession,
    canCreateLeads: (isAdmin || isEmpresaAdmin) && hasValidSession,
    canEditLeads: (isAdmin || isEmpresaAdmin) && hasValidSession,
    canDeleteLeads: (isAdmin || isEmpresaAdmin) && hasValidSession,

    // Campaigns
    canManageCampaigns: (isAdmin || isEmpresaAdmin) && hasValidSession,

    // Reporting
    canViewReports: (isAdmin || isEmpresaAdmin) && hasValidSession,

    // Administration (Web client only for security)
    canAccessAdmin: isAdmin && hasValidSession && isWebClient,

    // Session management
    canManageSessions: (isAdmin || isEmpresaAdmin) && hasValidSession,

    // Audit logs (Admin only)
    canViewAuditLogs: isAdmin && hasValidSession,

    // Scoping
    scopeToOrganization: !isAdmin
  }
}
```

## Validation Rules

### Role Assignment Validation
```typescript
interface RoleAssignmentRules {
  // Admin can assign any role to anyone
  admin: {
    canAssign: ['admin', 'empresa_admin', 'empresa_user', 'api_user']
    scope: 'global'
  }

  // Company admin can only assign within their org, excluding admin
  empresa_admin: {
    canAssign: ['empresa_admin', 'empresa_user', 'api_user']
    scope: 'organization'
    restrictions: ['cannot_assign_admin', 'same_organization_only']
  }

  // Regular users cannot assign roles
  empresa_user: {
    canAssign: []
    scope: 'none'
  }

  // API users cannot assign roles
  api_user: {
    canAssign: []
    scope: 'none'
  }
}
```

### Data Access Validation
```typescript
interface DataAccessRules {
  leads: {
    admin: 'all_organizations'
    empresa_admin: 'own_organization'
    empresa_user: 'assigned_only'
    api_user: 'api_endpoint_only'
  }

  users: {
    admin: 'all_organizations'
    empresa_admin: 'own_organization'
    empresa_user: 'none'
    api_user: 'none'
  }

  campaigns: {
    admin: 'all_organizations'
    empresa_admin: 'own_organization'
    empresa_user: 'read_only'
    api_user: 'none'
  }
}
```

## State Transitions

### User Role Changes
```typescript
interface RoleTransition {
  from: string
  to: string
  allowedBy: string[]
  validations: string[]
  effects: string[]
}

const roleTransitions: RoleTransition[] = [
  {
    from: 'empresa_user',
    to: 'empresa_admin',
    allowedBy: ['admin', 'empresa_admin'],
    validations: ['same_organization', 'user_active'],
    effects: ['invalidate_user_cache', 'log_role_change', 'notify_user']
  },
  {
    from: 'empresa_admin',
    to: 'admin',
    allowedBy: ['admin'],
    validations: ['super_admin_approval'],
    effects: ['grant_cross_org_access', 'log_privilege_escalation']
  }
]
```

### Session State Management
```typescript
interface SessionState {
  user: User
  permissions: ComputedPermissions
  cacheExpiry: number
  lastValidation: number
  isStale: boolean
}

interface SessionTransitions {
  'login' -> 'authenticated': ['validate_credentials', 'load_permissions']
  'role_changed' -> 'invalidated': ['clear_cache', 'reload_permissions']
  'logout' -> 'unauthenticated': ['clear_session', 'log_session_end']
  'token_expired' -> 'expired': ['show_reauth_prompt', 'preserve_context']
}
```

## Integration Points

### Frontend State Management
```typescript
// React Context Structure
interface AuthContextValue {
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

// Permission Cache Structure
interface PermissionCache {
  userId: string
  permissions: ComputedPermissions
  cachedAt: number
  expiresAt: number
  version: string
}
```

### Backend Integration
```typescript
// API Response Types
interface PermissionsResponse {
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

interface RoleUpdateRequest {
  userId: string
  newRole: string
  reason?: string
}

interface AuditLogRequest {
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
}
```

## Database Schema Considerations

### Current Schema Compatibility
- Manter tabela `roles` existente
- Adicionar campos opcionais para novas permissões
- Criar tabela `audit_logs` para rastreamento
- Adicionar índices para queries de permissão

### Migration Strategy
```sql
-- Extensão da tabela roles (manter compatibilidade)
ALTER TABLE roles ADD COLUMN IF NOT EXISTS admin_permissions JSONB;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS dashboard_permissions JSONB;

-- Nova tabela de audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
```

---
**Data Model Complete** ✓ - Entities, relationships, and validation rules defined