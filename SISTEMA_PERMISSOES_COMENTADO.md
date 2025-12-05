# Sistema de Permissões - COMENTADO

## 🚧 Status: COMENTADO - Aguardando Implementação no Backend

O sistema de permissões do frontend foi temporariamente comentado para aguardar a implementação no backend.

## 📋 O que foi Comentado:

### 1. **Arquivos Removidos**:
- ❌ `src/features/authentication/services/permissions.ts` - Serviços de API de permissões
- ❌ `src/features/authentication/hooks/usePermissions.ts` - Hook para gerenciar permissões
- ❌ `src/test/contract/permissions-validate.test.ts` - Testes de contrato para validação
- ❌ `src/test/contract/permissions-get.test.ts` - Testes de contrato para busca

### 2. **Arquivos Modificados (Comentados)**:
- ✅ `src/features/authentication/components/ProtectedRoute.tsx` - Proteção de rotas
- ✅ `src/features/authentication/components/RoleSelector.tsx` - Seletor de roles
- ✅ `src/shared/contexts/AuthContext.tsx` - Contexto de autenticação

### 3. **Estado Atual Temporário**:
- ✅ **ProtectedRoute**: Permite acesso a todas as rotas (apenas verifica autenticação)
- ✅ **RoleSelector**: Mostra todos os roles disponíveis
- ✅ **AuthContext**: Define permissões vazias após login

## 🎯 Implementação Esperada no Backend:

### 1. Endpoint de Login Retornando Permissões
```json
POST /api/v1/auth/login
Response:
{
  "user": {
    "id": 1,
    "name": "João Silva", 
    "email": "joao@empresa.com",
    "tenant_id": "vendas-ia"
  },
  "token": "jwt_token_here",
  "permissions": {
    "campaigns": ["create", "read", "update", "delete"],
    "pipeline": ["read"],
    "analytics": ["read", "export"],
    "billing": ["read"],
    "users": ["read", "update"]
  },
  "roles": ["empresa_admin"]
}
```

### 2. JWT Token Contendo Permissões
O token JWT deve conter as permissões para validação no frontend:
```json
{
  "sub": "1",
  "email": "joao@empresa.com",
  "permissions": {
    "campaigns": ["create", "read", "update", "delete"],
    "pipeline": ["read"]
  },
  "roles": ["empresa_admin"],
  "tenant_id": "vendas-ia",
  "exp": 1640995200
}
```

### 3. Middleware de Autorização no Backend
```typescript
// Backend - Middleware sugerido
function requirePermission(resource: string, action: string) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions
    if (hasPermission(userPermissions, resource, action)) {
      next()
    } else {
      res.status(403).json({ error: 'Forbidden' })
    }
  }
}

// Uso nas rotas
app.get('/api/campaigns', 
  authenticateToken, 
  requirePermission('campaigns', 'read'), 
  getCampaigns
)
```

## 🔄 Como Reativar no Frontend:

### 1. **Recriar Arquivos de Permissões**:

```typescript
// src/features/authentication/services/permissions.ts
export async function fetchUserPermissions(token: string) {
  // As permissões já vêm no login, não precisa buscar separadamente
  // Ou buscar do JWT token decodificado
  return parseJwtPermissions(token)
}

export async function validatePermission(
  permission: string, 
  action: string,
  context?: any
): Promise<boolean> {
  const { permissions } = useAuth()
  return permissions[permission]?.includes(action) || false
}
```

```typescript
// src/features/authentication/hooks/usePermissions.ts
export function usePermissions() {
  const { permissions, roles } = useAuth()
  
  return {
    permissions,
    hasPermission: (resource: string, action: string) => 
      permissions[resource]?.includes(action) || false,
    
    hasRole: (role: string) => roles.includes(role),
    
    // Helpers convenientes
    isAdmin: roles.includes('admin'),
    isCompanyAdmin: roles.includes('empresa_admin'),
    canManageUsers: hasPermission('users', 'write'),
    canManageCampaigns: hasPermission('campaigns', 'write'),
  }
}
```

### 2. **Atualizar AuthContext**:

```typescript
// src/shared/contexts/AuthContext.tsx - Remover comentários
const login = async (credentials) => {
  const response = await authService.login(credentials)
  
  setUser(response.user)
  setToken(response.token)
  setPermissions(response.permissions) // ← Usar permissões do backend
  setRoles(response.roles)
}
```

### 3. **Reativar Componentes**:

```typescript
// src/features/authentication/components/ProtectedRoute.tsx
// Descomentar todas as linhas com // COMENTADO
// Remover funções temporárias:
// - const hasPermission = (_permission: string) => true
// - const hasRole = (_role: string | string[]) => true

// src/features/authentication/components/RoleSelector.tsx  
// Descomentar o filtro de roles baseado em permissões
// Remover: const availableRoles = roles (linha temporária)
```

### 4. **Recriar Testes de Contrato**:

```typescript
// src/test/contract/permissions.test.ts
describe('Permissions Integration', () => {
  it('should receive permissions in login response', async () => {
    const response = await authService.login(credentials)
    
    expect(response).toHaveProperty('permissions')
    expect(response.permissions).toHaveProperty('campaigns')
    expect(Array.isArray(response.permissions.campaigns)).toBe(true)
  })
  
  it('should validate permissions from JWT token', async () => {
    const { permissions } = parseJwtToken(token)
    expect(permissions).toBeDefined()
  })
})
```

## 📁 Checklist de Reativação:

### Backend Pronto:
- [ ] Endpoint `/auth/login` retorna `permissions` e `roles`
- [ ] JWT token contém permissões
- [ ] Middleware de autorização implementado
- [ ] Testes de API funcionando

### Frontend Reativação:
- [ ] Recriar `src/features/authentication/services/permissions.ts`
- [ ] Recriar `src/features/authentication/hooks/usePermissions.ts`
- [ ] Descomentar `src/features/authentication/components/ProtectedRoute.tsx`
- [ ] Descomentar `src/features/authentication/components/RoleSelector.tsx`
- [ ] Atualizar `src/shared/contexts/AuthContext.tsx`
- [ ] Recriar testes de contrato
- [ ] Remover este arquivo de documentação

## 🚀 Próximo Passo:

Quando o backend implementar o sistema de permissões, seguir este checklist para reativar.

---

**Data da Desativação**: 14 de outubro de 2025  
**Motivo**: Aguardando implementação no backend  
**Status**: Sistema funciona temporariamente sem controle de permissões