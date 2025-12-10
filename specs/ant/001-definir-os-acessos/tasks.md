# Tasks: Sistema de Controle de Acesso e Permissões

**Input**: Documentos de design em `/specs/001-definir-os-acessos/`
**Pré-requisitos**: plan.md, research.md, data-model.md, contracts/auth-permissions.json, quickstart.md

## Fluxo de Execução (main)
```
1. ✓ Carregar plan.md da feature - React/TypeScript + Supabase + Tailwind
2. ✓ Carregar docs opcionais:
   → data-model.md: Role, User, UserSession, Organization, AuditLog entities
   → contracts/: auth-permissions.json (8 endpoints)
   → research.md: React Query cache strategy, multi-layer validation
3. ✓ Gerar tasks por categoria:
   → Setup: dependências, tipos, device management
   → Testes: contratos API, fluxos de integração, componentes
   → Core: hooks, contexts, componentes, API integration
   → Integração: session management, middleware, logging
   → Polish: admin interface, performance, docs
4. ✓ Regras aplicadas:
   → Arquivos diferentes = [P] para paralelo
   → Mesmo arquivo = sequencial
   → Testes antes da implementação (TDD)
5. ✓ Tasks numeradas T001-T044
6. ✓ Dependências mapeadas
7. ✓ Exemplos de execução paralela incluídos
```

## Formato: `[ID] [P?] Descrição`
- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- Caminhos exatos dos arquivos incluídos

## Phase 3.1: Setup

- [ ] T001 Install required dependencies (@tanstack/react-query, jwt-decode, react-hot-toast)
- [ ] T002 [P] Configure environment variables in .env.local
- [ ] T003 [P] Create TypeScript types in src/types/auth.ts
- [ ] T004 [P] Create device management utilities in src/lib/device.ts

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T005 [P] Contract test GET /api/v1/auth/permissions in src/test/contract/permissions-get.test.ts
- [ ] T006 [P] Contract test POST /api/v1/auth/permissions/validate in src/test/contract/permissions-validate.test.ts
- [ ] T007 [P] Contract test GET /api/v1/admin/roles in src/test/contract/admin-roles-get.test.ts
- [ ] T008 [P] Contract test POST /api/v1/admin/roles in src/test/contract/admin-roles-post.test.ts
- [ ] T009 [P] Contract test PUT /api/v1/admin/users/{userId}/role in src/test/contract/user-role-update.test.ts
- [ ] T010 [P] Contract test GET /api/v1/admin/audit-logs in src/test/contract/audit-logs-get.test.ts
- [ ] T011 [P] Contract test GET /api/v1/admin/sessions in src/test/contract/sessions-get.test.ts
- [ ] T012 [P] Contract test POST /api/v1/admin/sessions/{sessionId}/terminate in src/test/contract/session-terminate.test.ts

### Integration Tests
- [ ] T013 [P] Integration test: Admin role can access all permissions in src/test/integration/admin-access.test.tsx
- [ ] T014 [P] Integration test: Company admin manages users in same org in src/test/integration/company-admin-user-mgmt.test.tsx
- [ ] T015 [P] Integration test: Regular user has read-only access in src/test/integration/regular-user-access.test.tsx
- [ ] T016 [P] Integration test: Permission caching and invalidation in src/test/integration/permission-cache.test.tsx
- [ ] T017 [P] Integration test: Session validation and device management in src/test/integration/session-validation.test.tsx
- [ ] T018 [P] Integration test: Audit log creation on access attempts in src/test/integration/audit-logging.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### API Layer
- [ ] T019 [P] Implement permissions API client in src/lib/api/permissions.ts
- [ ] T020 [P] Implement sessions API client in src/lib/api/sessions.ts
- [ ] T021 [P] Implement audit API client in src/lib/api/audit.ts

### Hooks and Context
- [ ] T022 Create SessionContext and provider in src/contexts/SessionContext.tsx
- [ ] T023 Update AuthContext with permissions integration in src/contexts/AuthContext.tsx
- [ ] T024 [P] Create usePermissions hook in src/hooks/usePermissions.ts
- [ ] T025 [P] Create useRoles hook in src/hooks/useRoles.ts
- [ ] T026 [P] Create useAudit hook in src/hooks/useAudit.ts

### Core Components
- [ ] T027 [P] Create PermissionGate component in src/components/auth/PermissionGate.tsx
- [ ] T028 [P] Create ProtectedRoute component in src/components/auth/ProtectedRoute.tsx
- [ ] T029 [P] Create RoleSelector component in src/components/auth/RoleSelector.tsx

### Admin Interface Components
- [ ] T030 [P] Create UserManagement component in src/components/admin/UserManagement.tsx
- [ ] T031 [P] Create RoleManagement component in src/components/admin/RoleManagement.tsx
- [ ] T032 [P] Create SessionManagement component in src/components/admin/SessionManagement.tsx
- [ ] T033 [P] Create AuditLogViewer component in src/components/admin/AuditLogViewer.tsx

### Pages
- [ ] T034 Create AdminPage with role-based tabs in src/pages/AdminPage.tsx

## Phase 3.4: Integration

- [ ] T035 Integrate permission checking into existing navigation components
- [ ] T036 Add session management to login flow
- [ ] T037 Implement audit logging middleware for API calls
- [ ] T038 Add permission-based conditional rendering to dashboard

## Phase 3.5: Polish

### Unit Tests
- [ ] T039 [P] Unit tests for usePermissions hook in src/hooks/__tests__/usePermissions.test.ts
- [ ] T040 [P] Unit tests for PermissionGate component in src/components/auth/__tests__/PermissionGate.test.tsx
- [ ] T041 [P] Unit tests for admin components in src/components/admin/__tests__/

### Performance and Documentation
- [ ] T042 Performance optimization: permission cache tuning and lazy loading
- [ ] T043 [P] Add JSDoc comments to all permission-related functions
- [ ] T044 Manual testing: execute quickstart.md scenarios

## Dependencies

**Sequential Dependencies:**
- Tests (T005-T018) → Implementation (T019-T034)
- T002,T003,T004 → T022,T023 (contexts need types and environment)
- T019,T020,T021 → T024,T025,T026 (hooks need API clients)
- T022,T023 → T027,T028,T029 (components need contexts)
- T024,T025,T026 → T030,T031,T032,T033 (admin components need hooks)
- T027,T028,T029,T030,T031,T032,T033 → T034 (AdminPage needs all components)
- T034 → T035,T036,T037,T038 (integration needs core components)
- All implementation → Polish (T039-T044)

**Blocking Rules:**
- SessionContext (T022) must be complete before AuthContext update (T023)
- API clients (T019-T021) must exist before hooks (T024-T026)
- Core components (T027-T029) must exist before admin components (T030-T033)

## Parallel Execution Examples

### Setup Phase (can run together):
```bash
# Launch T002-T004 together:
Task: "Configure environment variables in .env.local"
Task: "Create TypeScript types in src/types/auth.ts"
Task: "Create device management utilities in src/lib/device.ts"
```

### Contract Tests (can run together):
```bash
# Launch T005-T012 together:
Task: "Contract test GET /api/v1/auth/permissions in src/test/contract/permissions-get.test.ts"
Task: "Contract test POST /api/v1/auth/permissions/validate in src/test/contract/permissions-validate.test.ts"
Task: "Contract test GET /api/v1/admin/roles in src/test/contract/admin-roles-get.test.ts"
Task: "Contract test POST /api/v1/admin/roles in src/test/contract/admin-roles-post.test.ts"
Task: "Contract test PUT /api/v1/admin/users/{userId}/role in src/test/contract/user-role-update.test.ts"
Task: "Contract test GET /api/v1/admin/audit-logs in src/test/contract/audit-logs-get.test.ts"
Task: "Contract test GET /api/v1/admin/sessions in src/test/contract/sessions-get.test.ts"
Task: "Contract test POST /api/v1/admin/sessions/{sessionId}/terminate in src/test/contract/session-terminate.test.ts"
```

### Integration Tests (can run together):
```bash
# Launch T013-T018 together:
Task: "Integration test: Admin role can access all permissions in src/test/integration/admin-access.test.tsx"
Task: "Integration test: Company admin manages users in same org in src/test/integration/company-admin-user-mgmt.test.tsx"
Task: "Integration test: Regular user has read-only access in src/test/integration/regular-user-access.test.tsx"
Task: "Integration test: Permission caching and invalidation in src/test/integration/permission-cache.test.tsx"
Task: "Integration test: Session validation and device management in src/test/integration/session-validation.test.tsx"
Task: "Integration test: Audit log creation on access attempts in src/test/integration/audit-logging.test.tsx"
```

### API Clients (can run together):
```bash
# Launch T019-T021 together:
Task: "Implement permissions API client in src/lib/api/permissions.ts"
Task: "Implement sessions API client in src/lib/api/sessions.ts"
Task: "Implement audit API client in src/lib/api/audit.ts"
```

### Hooks (can run together after API clients):
```bash
# Launch T024-T026 together:
Task: "Create usePermissions hook in src/hooks/usePermissions.ts"
Task: "Create useRoles hook in src/hooks/useRoles.ts"
Task: "Create useAudit hook in src/hooks/useAudit.ts"
```

### Core Components (can run together after contexts):
```bash
# Launch T027-T029 together:
Task: "Create PermissionGate component in src/components/auth/PermissionGate.tsx"
Task: "Create ProtectedRoute component in src/components/auth/ProtectedRoute.tsx"
Task: "Create RoleSelector component in src/components/auth/RoleSelector.tsx"
```

### Admin Components (can run together after hooks):
```bash
# Launch T030-T033 together:
Task: "Create UserManagement component in src/components/admin/UserManagement.tsx"
Task: "Create RoleManagement component in src/components/admin/RoleManagement.tsx"
Task: "Create SessionManagement component in src/components/admin/SessionManagement.tsx"
Task: "Create AuditLogViewer component in src/components/admin/AuditLogViewer.tsx"
```

### Unit Tests (can run together):
```bash
# Launch T039-T041 together:
Task: "Unit tests for usePermissions hook in src/hooks/__tests__/usePermissions.test.ts"
Task: "Unit tests for PermissionGate component in src/components/auth/__tests__/PermissionGate.test.tsx"
Task: "Unit tests for admin components in src/components/admin/__tests__/"
```

## Notes
- [P] tasks = different files, no shared dependencies
- Verify all tests fail before implementing (TDD requirement)
- Each task creates/modifies only one file except where noted
- Session management integrates with existing refresh token system (spec 003)
- Performance target: <200ms for permission checks
- All admin features require 'admin' or 'empresa_admin' role
- Device fingerprinting enhances session security

## Task Generation Rules Applied
*Successfully applied during execution*

1. **From Contracts**: 8 contract files → 8 contract test tasks [P]
2. **From Data Model**: 5 entities → API clients, hooks, and component tasks
3. **From Quickstart Scenarios**: 6 user stories → 6 integration tests [P]
4. **Ordering**: Setup → Tests → API → Contexts → Hooks → Components → Pages → Integration → Polish

## Validation Checklist
*GATE: All requirements satisfied*

- [x] All 8 API contracts have corresponding test tasks
- [x] All entities (Role, User, UserSession, Organization, AuditLog) have implementation tasks
- [x] All tests (T005-T018) come before implementation (T019-T044)
- [x] Parallel tasks [P] are truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD workflow enforced (tests first, implementation after)
- [x] Integration with existing refresh token system (spec 003) included

---
**Tasks Ready for Execution** ✓ - 44 tasks generated, dependencies mapped, parallel execution optimized