# Plano de Implementação: Sistema de Autenticação e Gerenciamento de Sessões

**Branch**: `003-sistema-de-autenticação` | **Data**: 2025-10-01 | **Spec**: [spec.md](./spec.md)  
**Input**: Especificação da feature em `/specs/003-sistema-de-autenticação/spec.md`

## Fluxo de Execução (comando /plan)
```
1. Carregar spec da feature do Input ✅
   → Spec carregada de /specs/003-sistema-de-autenticação/spec.md
2. Preencher Contexto Técnico ✅
   → Projeto React/TypeScript detectado
   → Stack: React 18+, TypeScript 5+, Vite, Tailwind, Supabase
   → Estrutura feature-based confirmada
3. Avaliar seção de Checagem da Constituição ✅
   → Verificação inicial de violações
   → Complexidade documentada quando necessário
   → Progresso: Checagem inicial
4. Executar Fase 0 → research.md ✅
   → Consolidar conhecimento técnico do INTEGRATION_GUIDE
5. Executar Fase 1 → contratos, data-model.md, quickstart.md ✅
   → Gerar modelo de dados baseado em entidades da spec
   → Criar contratos de tipos TypeScript
   → Documentar quickstart técnico
6. Reavaliar Constituição ✅
   → Verificar conformidade pós-design
   → Progresso: Pós-design
7. Planejar Fase 2 → Abordagem de geração de tasks ✅
8. PARAR - Pronto para comando /tasks ✅
```

**IMPORTANTE**: O comando /plan PARA no passo 7. As fases seguintes são executadas por outros comandos:
- Fase 2: /tasks gera o arquivo tasks.md
- Fase 3-4: Execução da implementação (manual ou via ferramentas)

---

## Resumo

O Sistema de Autenticação e Gerenciamento de Sessões implementa um modelo unificado de autenticação onde uma única sessão por dispositivo é compartilhada entre a aplicação web React e a extensão Chrome. O sistema inclui:

- **Autenticação robusta** com email/senha e emissão de tokens JWT (access + refresh)
- **Sessões compartilhadas** identificadas por device_id único persistente
- **Controle de licenças** baseado em limites por plano da empresa (Freemium: 1, Básico: 2, Premium: 5, Enterprise: 10)
- **Refresh automático** de tokens antes da expiração (< 5min restantes)
- **Device fingerprinting** para segurança e detecção de anomalias
- **Gestão de múltiplas sessões** com interface para visualização e revogação
- **Auditoria completa** de todos os eventos de sessão

A abordagem técnica segue a arquitetura feature-based existente, concentrando os componentes no diretório `src/features/authentication/` com utilitários compartilhados em `src/shared/utils/`.

---

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5+, React 18+  
**Dependências Principais**: 
- React 18+ (UI framework)
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Supabase (backend API - já existente)
- FingerprintJS ou implementação custom (device fingerprinting)

**Armazenamento**: 
- localStorage para device_id, tokens e estado de autenticação
- Backend Supabase para sessões, usuários e auditoria

**Testes**: 
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright ou Cypress (E2E tests)

**Plataforma Alvo**: Web moderna (Chrome, Firefox, Edge, Safari)

**Project Type**: Web application (frontend React)

**Performance Goals**: 
- Login < 2 segundos (p95)
- Token refresh < 500ms (p95)
- Auto-refresh transparente (usuário não percebe)

**Constraints**: 
- Compatibilidade com Chrome Extension (compartilhar device_id via localStorage)
- Conformidade com requisitos de segurança (hash de tokens, auditoria)
- Expiração de sessão em 45min de inatividade
- Refresh token antes de < 5min de expiração

**Scale/Scope**: 
- Suporte para múltiplos planos de empresas (4 tiers de licença)
- Gestão de até 10 sessões simultâneas por empresa (plano Enterprise)
- Integração com extensão Chrome existente

---

## Estrutura Recomendada

```
src/
  features/
    authentication/
      components/
        LoginForm.tsx              # Formulário de login
        SessionLimitModal.tsx      # Modal quando limite atingido
        SessionManager.tsx         # Lista e gestão de sessões ativas
        SessionCard.tsx            # Card individual de sessão
        ProtectedRoute.tsx         # HOC para rotas protegidas
        SessionExpirationWarning.tsx # Warning antes de expirar
      contexts/
        AuthContext.tsx            # Context provider de autenticação
      hooks/
        useAuth.ts                 # Hook principal de autenticação
        useAuthenticatedFetch.ts   # Hook para requests autenticados
        useActivityMonitor.ts      # Monitor de atividade do usuário
        useTokenRefresh.ts         # Lógica de refresh automático
      services/
        authService.ts             # Serviço de chamadas API auth
        sessionService.ts          # Serviço de gestão de sessões
      types/
        auth.ts                    # Types de autenticação
        session.ts                 # Types de sessão
      pages/
        LoginPage.tsx              # Página de login
        SessionsPage.tsx           # Página de gestão de sessões
      index.ts                     # Public API da feature

  shared/
    utils/
      device.ts                    # Device ID e fingerprinting
      token.ts                     # Utilitários de token JWT
      storage.ts                   # Abstrações de localStorage
    types/
      api.ts                       # Types de API (respostas, erros)
    services/
      apiClient.ts                 # Cliente HTTP com interceptors

  test/
    contract/
      auth-api.contract.test.ts    # Testes de contrato API
    integration/
      auth-flow.integration.test.ts # Testes de fluxo completo
      session-sharing.integration.test.ts
    mocks/
      authHandlers.ts              # Mock handlers MSW
```

---

## Comandos Úteis

```bash
# Instalar dependências
bun install

# Rodar dev server
bun run dev

# Rodar testes (todos)
bun test

# Rodar testes de contrato
bun test:contract

# Rodar testes de integração
bun test:integration

# Rodar testes de um arquivo específico
bun test src/features/authentication/hooks/useAuth.test.ts

# Lint
bun run lint

# Type check
bun run type-check

# Build
bun run build
```

---

## Constitution Check

**Simplicity**:
- ✅ Projects: 1 (frontend web application)
- ✅ Using React directly (no wrapper classes)
- ✅ Single data model (entidades claras: Session, Device, Token, User)
- ✅ Avoiding unnecessary patterns (usando Context API nativa do React)

**Architecture**:
- ✅ Feature-based architecture seguida (authentication feature)
- ✅ Libraries organizadas:
  - `features/authentication`: Componentes, hooks, services de autenticação
  - `shared/utils`: Utilitários reutilizáveis (device, token, storage)
- ✅ Public API via index.ts em cada feature
- ⚠️ CLI não aplicável (frontend web)
- ⚠️ llms.txt: A ser considerado para documentação de componentes

**Testing (NON-NEGOTIABLE)**:
- ✅ TDD será seguido rigorosamente
- ✅ Order: Contract → Integration → Unit
- ✅ Contract tests primeiro: API endpoints de auth
- ✅ Integration tests: Fluxos completos de login/logout
- ✅ Unit tests: Componentes, hooks, utils individuais
- ✅ Real dependencies: Testes de integração usarão API real ou test database
- ✅ Git commits mostrarão tests antes de implementação
- ✅ RED-GREEN-Refactor cycle enforced

**Observability**:
- ✅ Structured logging incluído via console com contexto
- ✅ Logs de erro centralizados (auth errors, session errors)
- ✅ Integração futura com Sentry ou similar
- ⚠️ Frontend logs → backend: A ser implementado via API endpoint

**Versioning**:
- ✅ Feature version: 1.0.0 (primeira implementação completa)
- ✅ BUILD increments: Cada PR incrementa build number
- ✅ Breaking changes: Compatibilidade com extensão Chrome deve ser mantida
- ✅ Migration plan: Se device_id format mudar, migração será necessária

**Constitutional Compliance (Projeto LeadsRápido)**:
- ✅ Componentização e reutilização: Componentes React funcionais com TypeScript
- ✅ Estado e contexto: Context API para estado global de autenticação
- ✅ Testes primeiro (TDD): 80% cobertura mínima
- ✅ Padronização visual: Tailwind CSS para todos os estilos
- ✅ Observabilidade: Logs centralizados de erros
- ✅ Simplicidade e clareza: JSDoc nos componentes principais

---

## Observações

### Dependências Externas
- **Backend API**: Endpoints já existentes (documentados em `INTEGRATION_GUIDE_REACT_FRONTEND.md`)
- **Chrome Extension**: Necessita compartilhar device_id via localStorage

### Riscos Identificados
1. **Device ID Loss**: Se usuário limpar localStorage, perde device_id (conta como novo device)
   - Mitigação: Documentar claramente, considerar recuperação via email
   
2. **Fingerprint Drift**: Atualizações de browser podem alterar fingerprint
   - Mitigação: Tolerar mudanças menores, apenas marcar como suspicious (não bloquear)
   
3. **Token Refresh Failure**: Falha de rede durante refresh
   - Mitigação: Retry com exponential backoff, fallback para re-login gracioso
   
4. **License Limit UX**: Usuário legítimo bloqueado por limite
   - Mitigação: UI clara para revogar sessões antigas

### Decisões Técnicas Pendentes
- ✅ Usar FingerprintJS library ou implementação custom? → Custom (mais controle, zero deps)
- ✅ Interceptor de axios ou fetch nativo? → Fetch nativo com wrapper (já no projeto)
- ✅ Context API ou Zustand? → Context API (mais simples, suficiente)
- ✅ Tokens em localStorage ou httpOnly cookies? → localStorage (compatível com extension)

---

## Project Structure

### Documentation (this feature)
```
specs/003-sistema-de-autenticação/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command - technical)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (feature-based architecture)
```
src/features/authentication/   # Authentication feature module
└── [components, hooks, services, types, pages, contexts]

src/shared/                    # Shared utilities and services
└── [utils, types, services]

src/test/                      # Test infrastructure
└── [contract, integration, mocks]
```

**Structure Decision**: Web application (Option 2 - frontend only)

---

## Phase 0: Outline & Research

### Objetivos
1. Consolidar conhecimento do `INTEGRATION_GUIDE_REACT_FRONTEND.md`
2. Documentar padrões de autenticação JWT + refresh token
3. Pesquisar melhores práticas de device fingerprinting
4. Estudar compartilhamento de storage com Chrome Extension
5. Definir estratégia de testes (contract, integration, unit)

### Research Tasks

#### Task 0.1: Consolidar Conhecimento da API Backend
- **Fonte**: `doc/INTEGRATION_GUIDE_REACT_FRONTEND.md`
- **Saída**: Documentar todos os endpoints de autenticação/sessão
- **Decisões**: Confirmar formato de requests/responses, error codes

#### Task 0.2: Padrões de Device Fingerprinting
- **Investigar**: Canvas fingerprinting, WebGL, hardware detection
- **Avaliar**: FingerprintJS library vs implementação custom
- **Decisão**: Implementação custom usando Canvas + WebGL + navigator APIs
- **Razão**: Mais controle, zero dependências externas, suficiente para nosso caso

#### Task 0.3: Estratégia de Token Refresh
- **Padrões**: Silent refresh, refresh token rotation
- **Timing**: Auto-refresh quando < 5min para expirar
- **Error handling**: Retry logic, fallback para re-login
- **Decisão**: Interceptor fetch com retry exponencial

#### Task 0.4: Compartilhamento de Storage com Extension
- **Desafio**: Como garantir mesmo device_id entre web e extension
- **Solução**: localStorage compartilhado (ambos acessam mesmo origin)
- **Alternativa**: chrome.storage.sync (apenas para extension)
- **Decisão**: localStorage como fonte única de verdade

#### Task 0.5: Estratégia de Testes
- **Contract Tests**: Validar schemas de API (Zod)
- **Integration Tests**: Fluxos completos de login/logout/refresh
- **Unit Tests**: Componentes, hooks, utils isolados
- **E2E Tests**: User journeys críticos (login → trabalho → logout)
- **Ferramentas**: Vitest (unit/integration), Playwright (E2E), MSW (mocks)

### Research Findings (to be documented in research.md)

**Output**: `research.md` completo com decisões técnicas e rationale

---

## Phase 1: Design & Contracts

### Objetivos
1. Definir modelo de dados TypeScript para entidades
2. Criar contratos de tipos para API requests/responses
3. Gerar testes de contrato que devem falhar inicialmente
4. Criar quickstart técnico para desenvolvedores
5. Extrair cenários de teste das user stories

### Design Tasks

#### Task 1.1: Modelo de Dados (data-model.md)
Extrair entidades da spec e definir interfaces TypeScript:

**Entidades Principais**:
- `User`: Dados do usuário autenticado
- `Session`: Sessão ativa com device_id
- `Device`: Informações do dispositivo
- `Token`: Access e refresh tokens
- `SessionAuditLog`: Log de eventos de sessão
- `CompanyLicenseConfig`: Configuração de limites

**Relações**:
- User 1:N Sessions
- Session 1:1 Device
- Session 1:N SessionAuditLog
- Company 1:1 CompanyLicenseConfig
- Company 1:N Users

#### Task 1.2: Contratos de API (/contracts/)
Definir tipos TypeScript para cada endpoint da API:

**Endpoints a Contratar**:
- `POST /auth/login` → LoginRequest, LoginResponse
- `POST /auth/refresh-token` → RefreshRequest, RefreshResponse
- `GET /sessions/active` → ActiveSessionsResponse
- `POST /sessions/{id}/validate` → ValidateSessionRequest, ValidateSessionResponse
- `DELETE /sessions/{id}` → RevokeSessionRequest, RevokeSessionResponse
- `GET /admin/sessions` → AdminSessionsResponse

**Formato**: Zod schemas para validação runtime + tipos TypeScript inferidos

#### Task 1.3: Contract Tests (Failing)
Para cada contrato, criar teste que valida request/response schema:

```typescript
// Exemplo: auth-login.contract.test.ts
describe('POST /auth/login Contract', () => {
  it('should match LoginRequest schema', () => {
    const request: LoginRequest = {
      email: 'test@example.com',
      password: 'password',
      device_id: 'uuid',
      device_fingerprint: 'fp_web_xxx',
      client_type: 'web'
    };
    expect(() => LoginRequestSchema.parse(request)).not.toThrow();
  });

  it('should match LoginResponse schema', async () => {
    // Este teste DEVE FALHAR inicialmente (sem implementação)
    const response = await authService.login(mockRequest);
    expect(() => LoginResponseSchema.parse(response)).not.toThrow();
  });
});
```

**Resultado Esperado**: Todos os testes de contrato falham (RED phase)

#### Task 1.4: Integration Test Scenarios
Extrair da spec os cenários de aceitação como testes de integração:

**Cenários Prioritários**:
1. First-time Login (Scenario 1)
2. Session Sharing Between Web and Extension (Scenario 2)
3. License Limit Enforcement (Scenario 3)
4. Automatic Token Refresh (Scenario 4)
5. Session Expiration After Inactivity (Scenario 5)
6. Manual Session Management (Scenario 6)
7. Suspicious Activity Detection (Scenario 7)

**Formato**: Testes integração que chamam API real (ou test DB)

#### Task 1.5: Quickstart Técnico (quickstart.md)
Documentar para desenvolvedores:
- Como rodar o projeto localmente
- Como executar testes
- Como fazer login e testar fluxo
- Como debugar problemas comuns
- Exemplo de código para usar `useAuth` hook

**Outputs**: 
- `data-model.md` ✅
- `contracts/` directory com Zod schemas ✅
- Contract tests (failing) ✅
- Integration test scenarios ✅
- `quickstart.md` técnico ✅

---

## Phase 2: Task Planning Approach

**IMPORTANTE**: Esta seção descreve a abordagem que será usada pelo comando `/tasks`. NÃO executar durante `/plan`.

### Task Generation Strategy

#### Fonte de Tarefas
1. **Contract Tests** (Phase 1) → Tarefas de implementação de schemas
2. **Data Model** (Phase 1) → Tarefas de criação de types/interfaces
3. **User Stories** (Spec) → Tarefas de implementação de features
4. **Components** (Design) → Tarefas de criação de componentes UI

#### Categorias de Tarefas

**1. Foundation (Base)**
- Setup de estrutura de diretórios
- Configuração de testes
- Types e interfaces base

**2. Core Logic (Lógica Central)**
- Device ID e fingerprinting utilities
- Auth service (API calls)
- Session service (API calls)
- Token utilities (decode, validate)

**3. React Integration (Integração React)**
- AuthContext provider
- useAuth hook
- useAuthenticatedFetch hook
- useTokenRefresh hook
- useActivityMonitor hook

**4. UI Components (Componentes de Interface)**
- LoginForm component
- SessionManager component
- SessionLimitModal component
- ProtectedRoute component
- SessionExpirationWarning component

**5. Testing (Testes)**
- Contract tests para cada endpoint
- Integration tests para cada user story
- Unit tests para utils, hooks, components
- E2E tests para fluxos críticos

#### Task Ordering Strategy

**TDD Order**: Tests → Implementation → Refactor

**Dependency Order**: 
1. Types/Interfaces (sem dependências)
2. Utils (dependem de types)
3. Services (dependem de utils)
4. Hooks (dependem de services)
5. Components (dependem de hooks)
6. Pages (dependem de components)

**Parallel Execution Markers**: `[P]` para tarefas independentes

#### Estimated Task Breakdown

```
Foundation (5 tasks) [P]
├── Setup directory structure
├── Configure test environment
├── Define core types (auth.ts, session.ts)
├── Define API contracts (Zod schemas)
└── Write contract tests (failing)

Core Logic (8 tasks)
├── Implement device.ts (getOrCreateDeviceId, generateFingerprint) [P]
├── Write tests for device.ts [P]
├── Implement token.ts (decode, validate, isExpiring) [P]
├── Write tests for token.ts [P]
├── Implement authService.ts (login, logout, refresh)
├── Write integration tests for authService
├── Implement sessionService.ts (list, validate, revoke)
└── Write integration tests for sessionService

React Integration (10 tasks)
├── Implement AuthContext.tsx (provider, initial state)
├── Write tests for AuthContext
├── Implement useAuth hook (login, logout, refresh)
├── Write tests for useAuth
├── Implement useTokenRefresh hook (auto-refresh logic)
├── Write tests for useTokenRefresh
├── Implement useActivityMonitor hook
├── Write tests for useActivityMonitor
├── Implement useAuthenticatedFetch hook
└── Write tests for useAuthenticatedFetch

UI Components (12 tasks)
├── Implement LoginForm.tsx
├── Write tests for LoginForm
├── Implement ProtectedRoute.tsx
├── Write tests for ProtectedRoute
├── Implement SessionManager.tsx
├── Write tests for SessionManager
├── Implement SessionCard.tsx
├── Write tests for SessionCard
├── Implement SessionLimitModal.tsx
├── Write tests for SessionLimitModal
├── Implement SessionExpirationWarning.tsx
└── Write tests for SessionExpirationWarning

Pages (4 tasks)
├── Implement LoginPage.tsx
├── Write tests for LoginPage
├── Implement SessionsPage.tsx
└── Write tests for SessionsPage

Integration & E2E (7 tasks)
├── Integration test: First-time login flow
├── Integration test: Session sharing with extension
├── Integration test: License limit enforcement
├── Integration test: Auto token refresh
├── Integration test: Session expiration
├── E2E test: Complete login → work → logout
└── E2E test: Multiple device sessions

Total: ~46 tasks
```

#### Task Template Format

```markdown
### Task {number}: {Description} {[P] if parallel}

**Type**: {Contract/Integration/Unit/Implementation}
**Dependencies**: {Previous task numbers or "None"}
**Test File**: {path/to/test/file if applicable}
**Implementation File**: {path/to/impl/file}
**Acceptance Criteria**:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests pass (if test task)
- [ ] Implementation makes tests pass (if impl task)

**Notes**: {Additional context, gotchas, links}
```

### Output Planning

O comando `/tasks` irá:
1. Carregar `plan.md` (este arquivo)
2. Carregar `data-model.md` e `contracts/`
3. Gerar `tasks.md` com ~46 tarefas numeradas e ordenadas
4. Marcar tarefas paralelas com `[P]`
5. Seguir ordem TDD: Test → Implementation → Refactor
6. Incluir acceptance criteria para cada tarefa

**Arquivo Gerado**: `tasks.md` (não criado pelo /plan)

---

## Phase 3+: Future Implementation

*Estas fases estão além do escopo do comando /plan*

**Phase 3**: Task execution  
- Executar tarefas do `tasks.md` em ordem
- Seguir TDD rigorosamente (RED → GREEN → REFACTOR)
- Commit após cada tarefa ou grupo lógico de tarefas

**Phase 4**: Implementation  
- Implementar todos os componentes, hooks, services
- Garantir 80%+ de cobertura de testes
- Code review e ajustes

**Phase 5**: Validation  
- Executar todos os testes (contract, integration, unit, E2E)
- Validar fluxos no navegador manualmente
- Testar compartilhamento com extensão Chrome
- Performance testing (login < 2s, refresh < 500ms)
- Security audit (tokens, fingerprinting, audit logs)

---

## Complexity Tracking

*Preencher APENAS se Constitution Check tiver violações que devem ser justificadas*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

**Notas**: Nenhuma violação constitucional identificada. O projeto segue todos os princípios:
- Componentização React padrão
- TDD enforced
- Tailwind CSS apenas
- Feature-based architecture respeitada
- Testes com dependências reais

---

## Progress Tracking

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (spec já tinha tudo definido)
- [x] Complexity deviations documented (nenhuma violação)

**Execution Log**:
- 2025-10-01 11:00 - Plan iniciado
- 2025-10-01 11:15 - Spec analisada, 40 requisitos funcionais identificados
- 2025-10-01 11:30 - Constitution check: PASS (sem violações)
- 2025-10-01 11:45 - Phase 0 planejada (research.md structure)
- 2025-10-01 12:00 - Phase 1 planejada (data-model, contracts, tests)
- 2025-10-01 12:15 - Phase 2 approach documentada (~46 tasks estimadas)
- 2025-10-01 12:30 - Plan completo, pronto para /tasks command

---

*Based on Constitution v2.1.1 - See `/.specify/memory/constitution.md`*
*Based on Feature Spec - See `./spec.md`*
*Integration Guide Reference - See `/doc/INTEGRATION_GUIDE_REACT_FRONTEND.md`*

*Based on Constitution v2.1.1 - See `/memory/constitution.md`*