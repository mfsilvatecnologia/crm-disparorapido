# Research: Sistema de Controle de Acesso e Permissões

**Fase 0 - Research & Investigation**
**Data**: 2025-09-15

## Análise do Sistema Atual

### 1. Estrutura de Roles no Banco (roles_rows.sql)

**Roles Existentes**:
- `admin` - Administrador do sistema com permissões {"all": true}
- `empresa_admin` - Administrador da empresa com {"leads": "all", "usuarios": "manage", "campanhas": "all"}
- `empresa_user` - Usuário padrão da empresa com {"leads": "read", "campanhas": "read"}
- `api_user` - Acesso via API com {"leads": "api", "webhooks": "receive"}

**Decision**: Manter estrutura atual de roles, expandir permissões granulares conforme necessário
**Rationale**: Sistema já implementado e funcionando, mudanças estruturais causariam breaking changes
**Alternatives considered**: Reestruturação completa das roles (descartada por complexidade de migração)

### 2. Endpoints de Autenticação Existentes (swagger.json)

**Endpoints Disponíveis**:
- `POST /auth/register` - Registro de usuários
- `POST /auth/login` - Login com email/password
- `POST /auth/reset-password` - Reset de senha
- Authentication via Bearer JWT token

**Gaps Identificados**:
- Falta endpoint para obter permissões do usuário atual
- Não existe endpoint para gestão de roles de usuários
- Ausência de endpoints para auditoria de acesso
- Sem endpoint para listar/criar roles customizadas

**Decision**: Implementar novos endpoints específicos para autorização
**Rationale**: Separação de responsabilidades entre autenticação e autorização
**Alternatives considered**: Expandir endpoints existentes (descartada por violação de SRP)

### 3. Best Practices para RBAC em React/TypeScript

**Pesquisa Realizada**:

**Pattern: Permission Gates**
- Componentes wrapper que controlam renderização baseada em permissões
- Vantagem: Declarativo, fácil de usar, type-safe
- Implementação: `<PermissionGate permission="leads.create">...</PermissionGate>`

**Decision**: Implementar Permission Gates como componente principal de controle
**Rationale**: Padrão amplamente adotado, intuitivo para desenvolvedores React
**Alternatives considered**: HOCs (mais complexos), hooks apenas (menos declarativo)

**Pattern: Context + Hooks**
- Context para estado global de permissões
- Hooks customizados para validação (usePermissions, useHasRole)
- Cache inteligente com react-query

**Decision**: Usar Context API com react-query para cache
**Rationale**: Performance + simplicidade, sem dependências pesadas
**Alternatives considered**: Redux (overkill), Zustand (desnecessário para este escopo)

### 4. Estratégias de Cache para Permissões

**React Query Investigation**:
- Cache automático com invalidação inteligente
- Stale-while-revalidate strategy
- Background updates sem bloquear UI
- Retry automático em caso de falhas

**Decision**: Implementar cache com react-query, TTL de 5 minutos
**Rationale**: Balance entre performance e consistência de dados
**Alternatives considered**: Cache manual (mais trabalho), sem cache (performance ruim)

**Cache Strategy**:
```typescript
// Implementação planejada
const { data: permissions } = useQuery({
  queryKey: ['permissions', userId],
  queryFn: fetchUserPermissions,
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
})
```

### 5. Middleware de Validação de Acesso

**Pattern Analysis**:
- Router guards para proteção de rotas
- Component-level protection com Permission Gates
- API request interceptors para adicionar contexto de autorização

**Decision**: Implementar proteção em múltiplas camadas
**Rationale**: Defense in depth, cada camada protege contra diferentes vetores
**Alternatives considered**: Proteção apenas no backend (UX ruim), apenas no frontend (inseguro)

### 6. Estratégia de Fallback para Conectividade

**Offline Strategy**:
- Cache pessimista: assumir menor privilégio quando offline
- Graceful degradation: mostrar conteúdo básico
- Queue de ações para sincronização quando online

**Decision**: Cache pessimista com UI de estado offline
**Rationale**: Segurança primeiro, UX degradada mas funcional
**Alternatives considered**: Cache otimista (risco de segurança), bloqueio total (UX ruim)

### 7. Performance de Validações em Tempo Real

**Benchmarking Research**:
- Validação local: <1ms (aceitável)
- Validação via API: 50-200ms (aceitável com cache)
- Validação sem cache: 200-500ms (inaceitável)

**Decision**: Validação híbrida (local + cache + API background)
**Rationale**: Melhor UX mantendo segurança
**Alternatives considered**: Apenas local (inseguro), apenas API (lento)

**Implementation Strategy**:
```typescript
// Pseudo-código da estratégia
function usePermissions(permission: string) {
  const cached = getCachedPermission(permission)
  const { data } = useQuery(['permission', permission], {
    enabled: !cached || isStale(cached),
    initialData: cached
  })
  return data || cached || false // Fallback pessimista
}
```

## Dependencies & Libraries Research

### Required Dependencies Analysis

**@tanstack/react-query**
- Version: ^4.29.0 (stable, ampla adoção)
- Purpose: Cache inteligente de permissões
- Alternative: SWR (similar, mas react-query tem melhor TypeScript support)

**jwt-decode**
- Version: ^3.1.2 (leve, sem dependências)
- Purpose: Extrair informações de role do token JWT
- Alternative: Implementação manual (mais trabalho, reinventando a roda)

**react-hot-toast**
- Version: ^2.4.1 (já usado no projeto)
- Purpose: Notificações de erro de acesso
- Alternative: Criar sistema próprio (duplicação de esforço)

### Integration Challenges

**Challenge**: Migração gradual sem quebrar funcionalidades existentes
**Solution**: Feature flags + backward compatibility layer

**Challenge**: Performance com múltiplas validações simultâneas
**Solution**: Batch validation + debouncing

**Challenge**: Sincronização entre abas do browser
**Solution**: BroadcastChannel API para sync de cache

## Technical Decisions Summary

| Aspecto | Decisão | Justificativa |
|---------|---------|---------------|
| **Role Structure** | Manter atual + extensões | Evitar breaking changes |
| **Cache Strategy** | React Query + 5min TTL | Balance performance/consistência |
| **Validation** | Multi-layer (router + component + API) | Defense in depth |
| **Offline Handling** | Cache pessimista | Segurança primeiro |
| **Permission Model** | Hierarchical inheritance | Simplifica gestão |

## Risks Mitigation

**Risk**: Performance degradation with permission checks
**Mitigation**: Aggressive caching + background updates + batch validation

**Risk**: Cache inconsistency between users
**Mitigation**: Server-sent events para invalidação em tempo real

**Risk**: Complex migration path
**Mitigation**: Feature flags + gradual rollout + rollback plan

## Next Steps (Phase 1)

1. Design detailed data model based on current role structure
2. Define API contracts for missing authorization endpoints
3. Create detailed component architecture
4. Plan integration tests scenarios
5. Design quickstart implementation guide

---
**Research Complete** ✓ - Ready for Phase 1 Design & Contracts