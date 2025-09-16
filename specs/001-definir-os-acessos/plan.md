# Plano de Implementação: Sistema de Controle de Acesso e Permissões

**Branch**: `001-definir-os-acessos` | **Data**: 2025-09-15 | **Spec**: [spec.md](./spec.md)
**Input**: Especificação da feature em `/specs/001-definir-os-acessos/spec.md`

## Fluxo de Execução (comando /plan)
```
1. Carregar spec da feature do Input
   ✓ Feature request: Define access control system with hierarchical permissions
2. Preencher Contexto Técnico (detectar dúvidas, stack, dependências)
   ✓ Detectar tipo de projeto (React/TypeScript, Vite, Tailwind)
   ✓ Definir estrutura de arquivos (src/components, src/pages, hooks, etc)
3. Avaliar seção de Checagem da Constituição
   → Se houver violações: Documentar no tracking de complexidade
   → Se não justificar: ERRO "Simplifique a abordagem"
   → Atualizar progresso: Checagem inicial
4. Executar Fase 0 → research.md
   → Se restarem dúvidas: ERRO "Resolva pendências primeiro"
5. Executar Fase 1 → contratos, data-model.md, quickstart.md, instruções para Copilot
6. Reavaliar Constituição
   → Se surgirem novas violações: Refatorar design, voltar à Fase 1
   → Atualizar progresso: Pós-design
7. Planejar Fase 2 → Descrever abordagem de geração de tasks (NÃO criar tasks.md ainda)
8. PARAR - Pronto para comando /tasks
```

**IMPORTANTE**: O comando /plan PARA no passo 7. As fases seguintes são executadas por outros comandos:
- Fase 2: /tasks gera o arquivo tasks.md
- Fase 3-4: Execução da implementação (manual ou via ferramentas)

## Resumo
Sistema de controle de acesso baseado em roles hierárquicos para LeadsRápido, implementando permissões granulares para três perfis principais: Administrador (controle total), Gerente (gestão da empresa), e Usuário (operações básicas). A implementação incluirá validação de permissões em tempo real, middleware de autorização, componentes React protegidos, e interface administrativa para gestão de roles e permissões.

## Contexto Técnico
**Linguagem/Versão**: TypeScript 5+, React 18+
**Dependências Principais**: React, Vite, Tailwind, Supabase, React Router, React Hook Form, Zod
**Armazenamento**: Supabase (roles, users, permissions, audit logs, user_sessions)
**Testes**: Jest, React Testing Library
**Plataforma Alvo**: Web moderna (Chrome, Firefox, Edge)

### Dependências Adicionais Necessárias:
- `@tanstack/react-query` - Para cache e sincronização de estado das permissões
- `jwt-decode` - Para decodificar tokens JWT e extrair informações de role
- `react-hot-toast` - Para notificações de erro de acesso
- Possível middleware personalizado para validação de permissões

### Integração com Sistema de Sessões Existente:
- **Refresh Token System**: Sistema já implementado na spec 003-refresh-token-implementar
- **Session Control**: Controle de sessões simultâneas por empresa já disponível
- **Device Management**: Sistema de deviceId e fingerprint para múltiplos clientes
- **Multi-tenant**: Suporte a múltiplas organizações com isolamento de dados

## Estrutura Recomendada
```
src/
  components/
    auth/
      PermissionGate.tsx        # Componente para controle de acesso
      RoleSelector.tsx          # Seletor de roles
    admin/
      UserManagement.tsx        # Interface de gestão de usuários
      RoleManagement.tsx        # Interface de gestão de roles
  pages/
    AdminPage.tsx              # Página administrativa
  hooks/
    usePermissions.tsx         # Hook para verificação de permissões
    useRoles.tsx              # Hook para gestão de roles
  contexts/
    AuthContext.tsx           # Context atualizado com roles
    PermissionContext.tsx     # Context para permissões
  lib/
    permissions.ts            # Utilitários de permissão
    api/
      auth.ts                 # API de autenticação/autorização
      roles.ts                # API de roles
  types/
    auth.ts                   # Tipos de roles e permissões
```

## Comandos Úteis
- Instalar dependências: `npm install`
- Rodar dev: `npm run dev`
- Rodar testes: `npm run test`
- Lint: `npm run lint`

## Checagem da Constituição
- [x] Componentização e reutilização - Sistema modular com componentes React
- [x] Testes automatizados (TDD) - Cobertura completa dos componentes de autorização
- [x] Uso de Tailwind para estilos - Interface administrativa com Tailwind
- [x] Padronização de código (ESLint/Prettier) - Conformidade com padrões
- [x] Logs e tratamento de erros - Auditoria de tentativas de acesso

## Observações
**Project Type**: web - Frontend React com backend API
**Performance Goals**: <200ms para validação de permissões, cache eficiente de roles
**Constraints**: Compatibilidade com sistema de autenticação existente, manter estrutura de banco atual
**Scale/Scope**: Suporte para múltiplas organizações, centenas de usuários por empresa

**Riscos Identificados**:
- Necessidade de migração de dados existentes no banco
- Impacto em sessões ativas durante implementação
- Validação de permissões pode impactar performance se mal implementada
- Integração com sistema de sessões existente deve manter compatibilidade

**Integração com Refresh Token System**:
- Permissões serão validadas junto com refresh tokens
- User sessions (spec 003) serão estendidas com informações de role
- Device fingerprint será utilizado para validação adicional de segurança
- Audit logs de acesso integrados com session audit logs existentes

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (frontend web app com componentes de autorização)
- Using framework directly? ✓ (React direto, sem wrappers desnecessários)
- Single data model? ✓ (roles e permissions unificados)
- Avoiding patterns? ✓ (sem Repository/UoW, API direta)

**Architecture**:
- EVERY feature as library? ✓ (componentes reutilizáveis, hooks customizados)
- Libraries listed: PermissionGate (controle acesso), usePermissions (hook validação), RoleManagement (admin interface)
- CLI per library: N/A (componentes React)
- Library docs: Documentação JSDoc nos componentes

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? ✓ (testes primeiro para componentes críticos)
- Git commits show tests before implementation? ✓ (estrutura TDD)
- Order: Contract→Integration→E2E→Unit strictly followed? ✓
- Real dependencies used? ✓ (testes com Supabase local)
- Integration tests for: componentes de autorização, fluxos de login/permissão
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? ✓ (logs de tentativas de acesso, erros de permissão)
- Frontend logs → backend? ✓ (auditoria centralizada)
- Error context sufficient? ✓ (contexto completo para debug)

**Versioning**:
- Version number assigned? 1.0.0 (novo sistema de permissões)
- BUILD increments on every change? ✓
- Breaking changes handled? ✓ (migração gradual, compatibilidade reversa)

## Project Structure

### Documentation (this feature)
```
specs/001-definir-os-acessos/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── components/auth/
├── components/admin/
├── hooks/
├── contexts/
├── lib/permissions/
└── types/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Single web project (Option 1) - Frontend React com integração API backend

## Phase 0: Outline & Research

**Research Tasks Identified**:
1. Análise da estrutura atual de roles no banco de dados (roles_rows.sql)
2. Avaliação de endpoints existentes de autenticação (swagger.json)
3. Identificação de gaps nos endpoints de autorização
4. Pesquisa de best practices para RBAC em React/TypeScript
5. Estratégias de cache para permissões em frontend

**Research Dispatch**:
- Investigar biblioteca react-query para cache de permissões
- Analisar padrões de middleware para validação de acesso
- Definir estratégia de fallback para perda de conectividade
- Avaliar impacto de performance de validações em tempo real

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

**Entities from Spec**:
- Role (admin, empresa_admin, empresa_user, api_user)
- User (com role assignment)
- Permission (granular access rights)
- Organization (multi-tenant scoping)
- Audit Log (compliance tracking)

**API Contracts Needed**:
- GET /api/v1/auth/permissions - Obter permissões do usuário atual
- GET /api/v1/admin/roles - Listar roles disponíveis
- POST/PUT/DELETE /api/v1/admin/users/{id}/role - Gestão de roles de usuários
- GET /api/v1/admin/audit-logs - Logs de auditoria
- POST /api/v1/admin/roles - Criar/editar roles customizadas

**Test Scenarios from User Stories**:
- Admin pode criar/editar usuários em qualquer organização
- Manager pode gerenciar usuários apenas da sua organização
- User regular não acessa funcionalidades administrativas
- Logs de auditoria capturam tentativas de acesso negado

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Componentes de autorização (PermissionGate, RoleSelector)
- Hooks de permissão (usePermissions, useRoles)
- Context providers (AuthContext atualizado, PermissionContext)
- Páginas administrativas (UserManagement, RoleManagement)
- Middleware de validação
- Testes de integração para fluxos críticos

**Ordering Strategy**:
- 1. Tipos TypeScript e contratos
- 2. Hooks de base (usePermissions)
- 3. Componentes de controle (PermissionGate)
- 4. Context providers
- 5. Interfaces administrativas
- 6. Integração com páginas existentes
- 7. Testes end-to-end

**Estimated Output**: 28-32 numbered tasks focusing on TDD implementation

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No constitutional violations detected - implementation follows established patterns*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command - describe approach only) ✅
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented ✅ (None detected)

**Artifacts Generated**:
- [x] research.md - Technical research and decisions ✅
- [x] data-model.md - Entity definitions and relationships (Updated with session integration) ✅
- [x] contracts/auth-permissions.json - API contract specifications (Updated with session endpoints) ✅
- [x] quickstart.md - Implementation guide and examples (Updated with session integration) ✅
- [ ] tasks.md - Detailed implementation tasks (Next: /tasks command)

**Integration with Refresh Token System (spec 003) Completed**:
- [x] Session entities integrated into permission data model ✅
- [x] Device ID and fingerprint management added ✅
- [x] Session-aware permission validation implemented ✅
- [x] Multi-client support (web + extension) integrated ✅
- [x] Session management endpoints added to API contracts ✅
- [x] Enhanced audit logging with session context ✅

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*