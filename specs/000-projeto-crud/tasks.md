---
description: "Implementation tasks for Sistema de CRUD de Projetos de Resolução de Problemas"
---

# Tasks: Sistema de CRUD de Projetos de Resolução de Problemas

**Branch**: `001-projeto-crud`
**Input**: Design documents from `/specs/001-projeto-crud/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Contract + integration tests are expected per Constitution principle "Test-First Delivery". Tests MUST be written before implementation and fail (RED) before code is written.

**Organization**: Tasks are grouped by user story (P1, P2, P3) to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

Project structure: `src/features/resolucao-problemas/` (feature-modular architecture)
- Types: `src/features/resolucao-problemas/types/`
- Services: `src/features/resolucao-problemas/services/`
- Hooks: `src/features/resolucao-problemas/hooks/`
- Components: `src/features/resolucao-problemas/components/`
- Pages: `src/features/resolucao-problemas/pages/`
- Validators: `src/features/resolucao-problemas/validators/`
- Tests: `tests/contract/resolucao-problemas/`, `tests/integration/resolucao-problemas/`, `tests/unit/resolucao-problemas/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create feature directory structure at src/features/resolucao-problemas/ with subdirectories: types/, services/, hooks/, components/, pages/, validators/
- [X] T002 Create test directory structure at tests/contract/resolucao-problemas/, tests/integration/resolucao-problemas/, tests/unit/resolucao-problemas/
- [X] T003 [P] Create barrel export file at src/features/resolucao-problemas/index.ts for public API
- [X] T004 [P] Configure MSW (Mock Service Worker) handlers in tests/contract/mocks/handlers.ts
- [X] T005 [P] Configure Cypress/Playwright setup in tests/integration/support/setup.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### TypeScript Types (Foundation)

- [X] T006 [P] Create Metodologia enum in src/features/resolucao-problemas/types/projeto.types.ts (MASP, 8D, A3)
- [X] T007 [P] Create ProjetoStatus enum in src/features/resolucao-problemas/types/projeto.types.ts (PLANEJAMENTO, EM_ANDAMENTO, AGUARDANDO, CONCLUIDO, CANCELADO, ARQUIVADO)
- [X] T008 [P] Create EtapaStatus enum in src/features/resolucao-problemas/types/etapa.types.ts (PENDENTE, EM_ANDAMENTO, CONCLUIDA, BLOQUEADA)
- [X] T009 Create ProjetoBase interface in src/features/resolucao-problemas/types/projeto.types.ts
- [X] T010 Create ProjetoSemMetodologia interface extending ProjetoBase in src/features/resolucao-problemas/types/projeto.types.ts
- [X] T011 Create ProjetoComMetodologia interface extending ProjetoBase in src/features/resolucao-problemas/types/projeto.types.ts
- [X] T012 Create Projeto union type (ProjetoSemMetodologia | ProjetoComMetodologia) in src/features/resolucao-problemas/types/projeto.types.ts
- [X] T013 [P] Create Cliente interface in src/features/resolucao-problemas/types/cliente.types.ts
- [X] T014 [P] Create Responsavel interface in src/features/resolucao-problemas/types/responsavel.types.ts
- [X] T015 [P] Create WorkflowEtapa polymorphic types (EtapaMasp, Etapa8D, EtapaA3) in src/features/resolucao-problemas/types/etapa.types.ts

### API Request/Response Types

- [X] T016 [P] Create CreateProjetoRequest interface in src/features/resolucao-problemas/types/api.types.ts
- [X] T017 [P] Create UpdateProjetoRequest interface in src/features/resolucao-problemas/types/api.types.ts
- [X] T018 [P] Create DefinirMetodologiaRequest interface in src/features/resolucao-problemas/types/api.types.ts
- [X] T019 [P] Create ListProjetosQuery interface in src/features/resolucao-problemas/types/api.types.ts
- [X] T020 [P] Create PaginatedResponse generic type in src/features/resolucao-problemas/types/api.types.ts

### Validators (Zod Schemas)

- [X] T021 [P] Create projetoCreateSchema Zod validator in src/features/resolucao-problemas/validators/projetoValidator.ts
- [X] T022 [P] Create projetoUpdateSchema Zod validator in src/features/resolucao-problemas/validators/projetoValidator.ts
- [X] T023 [P] Create definirMetodologiaSchema Zod validator in src/features/resolucao-problemas/validators/metodologiaValidator.ts

### API Client

- [X] T024 Create Axios instance with JWT interceptor in src/features/resolucao-problemas/services/apiClient.ts
- [X] T025 Add error transformation logic to Axios response interceptor in src/features/resolucao-problemas/services/apiClient.ts

### TanStack Query Setup

- [X] T026 Configure QueryClient with 5min stale time in src/main.tsx or src/App.tsx
- [X] T027 Add TanStack Query DevTools to development environment in src/App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Criar Novo Projeto (Priority: P1) 🎯 MVP

**Goal**: Permitir que usuários criem novos projetos de resolução de problemas sem definir metodologia inicialmente

**Independent Test**: Abrir interface de criação, preencher campos obrigatórios (cliente, título, descrição), submeter e verificar que projeto é criado com metodologia NULL e aparece na listagem

### Tests for User Story 1 (write before implementation) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T028 [P] [US1] Contract test for POST /resolucao-problemas/projetos in tests/contract/resolucao-problemas/projetoService.contract.test.ts (verify request/response matches OpenAPI spec)
- [X] T029 [P] [US1] Integration test for create project flow in tests/integration/resolucao-problemas/criar-projeto.spec.ts (E2E: open form → fill → submit → verify success)

### Implementation for User Story 1

#### Service Layer

- [X] T030 [US1] Implement projetoService.criar() function in src/features/resolucao-problemas/services/projetoService.ts (POST /api/v1/resolucao-problemas/projetos)

#### Hooks

- [X] T031 [US1] Implement useCreateProjeto mutation hook in src/features/resolucao-problemas/hooks/useProjeto.ts (TanStack Query mutation with cache invalidation)

#### Components

- [X] T032 [P] [US1] Create ProjetoForm component in src/features/resolucao-problemas/components/projeto/ProjetoForm.tsx (React Hook Form + Zod validation)
- [X] T033 [P] [US1] Create ClienteAutocomplete component in src/features/resolucao-problemas/components/shared/ClienteAutocomplete.tsx
- [X] T034 [P] [US1] Create UserSelector component in src/features/resolucao-problemas/components/shared/UserSelector.tsx
- [X] T035 [US1] Create ProjetoCreateModal component in src/features/resolucao-problemas/components/projeto/ProjetoCreateModal.tsx (modal wrapper for ProjetoForm)

#### Pages

- [X] T036 [US1] Create ProjetoNovoPage component in src/features/resolucao-problemas/pages/ProjetoNovoPage.tsx (route /projetos/novo)

#### Routing

- [X] T037 [US1] Add /projetos/novo route to React Router configuration

#### Unit Tests

- [X] T038 [P] [US1] Unit test for ProjetoForm validation in tests/unit/resolucao-problemas/ProjetoForm.test.tsx
- [X] T039 [P] [US1] Unit test for projetoCreateSchema validator in tests/unit/resolucao-problemas/projetoValidator.test.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create projects without methodology

---

## Phase 4: User Story 2 - Definir Metodologia do Projeto (Priority: P1)

**Goal**: Permitir que usuários definam a metodologia (MASP, 8D, A3) de um projeto criado, inicializando automaticamente as etapas correspondentes

**Independent Test**: Criar projeto sem metodologia, acessá-lo, selecionar metodologia (ex: MASP), verificar que 8 etapas MASP são inicializadas

### Tests for User Story 2 (write before implementation) ⚠️

- [X] T040 [P] [US2] Contract test for POST /resolucao-problemas/projetos/:id/metodologia in tests/contract/resolucao-problemas/metodologia.contract.test.ts
- [X] T041 [P] [US2] Integration test for define methodology flow in tests/integration/resolucao-problemas/definir-metodologia.spec.ts (E2E: open project → click define → select MASP → verify stages created)

### Implementation for User Story 2

#### Service Layer

- [X] T042 [US2] Implement projetoService.definirMetodologia() function in src/features/resolucao-problemas/services/projetoService.ts (POST /api/v1/resolucao-problemas/projetos/:id/metodologia)

#### Hooks

- [X] T043 [US2] Implement useDefinirMetodologia mutation hook in src/features/resolucao-problemas/hooks/useDefinirMetodologia.ts (TanStack Query mutation with optimistic update)

#### Components

- [X] T044 [P] [US2] Create MetodologiaSelector component in src/features/resolucao-problemas/components/metodologia/MetodologiaSelector.tsx (radio group with MASP/8D/A3 options)
- [X] T045 [P] [US2] Create MetodologiaBadge component in src/features/resolucao-problemas/components/metodologia/MetodologiaBadge.tsx (badge showing MASP/8D/A3 or "Pendente")
- [X] T046 [US2] Create DefinirMetodologiaModal component in src/features/resolucao-problemas/components/metodologia/DefinirMetodologiaModal.tsx (modal with MetodologiaSelector)

#### Type Guards

- [X] T047 [US2] Add isProjetoComMetodologia type guard in src/features/resolucao-problemas/types/projeto.types.ts

#### Unit Tests

- [X] T048 [P] [US2] Unit test for MetodologiaSelector component in tests/unit/resolucao-problemas/MetodologiaSelector.test.tsx
- [X] T049 [P] [US2] Unit test for definirMetodologiaSchema validator in tests/unit/resolucao-problemas/metodologiaValidator.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users can create projects and define methodology

---

## Phase 5: User Story 3 - Visualizar Lista de Projetos (Priority: P1)

**Goal**: Permitir que usuários visualizem todos os projetos com filtros, paginação e busca

**Independent Test**: Criar projetos de teste e verificar que todos aparecem na listagem com informações principais (título, metodologia, status, cliente)

### Tests for User Story 3 (write before implementation) ⚠️

- [X] T050 [P] [US3] Contract test for GET /resolucao-problemas/projetos in tests/contract/resolucao-problemas/projetoService.contract.test.ts (verify pagination, filters)
- [X] T051 [P] [US3] Integration test for list/filter/pagination in tests/integration/resolucao-problemas/listar-projetos.spec.ts (E2E: open list → apply filters → paginate → search)

### Implementation for User Story 3

#### Service Layer

- [X] T052 [US3] Implement projetoService.listar() function in src/features/resolucao-problemas/services/projetoService.ts (GET /api/v1/resolucao-problemas/projetos with query params)

#### Hooks

- [X] T053 [US3] Implement useProjetos query hook in src/features/resolucao-problemas/hooks/useProjetos.ts (TanStack Query with keepPreviousData for smooth pagination)

#### Components

- [X] T054 [P] [US3] Create ProjetoCard component in src/features/resolucao-problemas/components/projeto/ProjetoCard.tsx (card showing projeto summary)
- [X] T055 [P] [US3] Create ProjetoStatusBadge component in src/features/resolucao-problemas/components/projeto/ProjetoStatusBadge.tsx (badge for status)
- [X] T056 [P] [US3] Create EmptyState component in src/features/resolucao-problemas/components/shared/EmptyState.tsx (message when no projects)
- [X] T057 [US3] Create ProjetoList component in src/features/resolucao-problemas/components/projeto/ProjetoList.tsx (list with filters, pagination, search)

#### Pages

- [X] T058 [US3] Create ProjetosIndexPage component in src/features/resolucao-problemas/pages/ProjetosIndexPage.tsx (route /projetos)

#### Routing

- [X] T059 [US3] Add /projetos route to React Router configuration

#### Unit Tests

- [X] T060 [P] [US3] Unit test for ProjetoCard component in tests/unit/resolucao-problemas/ProjetoCard.test.tsx
- [X] T061 [P] [US3] Unit test for ProjetoList filtering logic in tests/unit/resolucao-problemas/ProjetoList.test.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 form the complete MVP - create, define methodology, and list projects

---

## Phase 6: User Story 4 - Visualizar Detalhes do Projeto (Priority: P2)

**Goal**: Permitir que usuários acessem informações detalhadas de um projeto específico, incluindo etapas, participantes e progresso

**Independent Test**: Clicar em projeto na listagem e verificar que todas informações são exibidas (dados do projeto, etapas, participantes, progresso)

### Tests for User Story 4 (write before implementation) ⚠️

- [ ] T062 [P] [US4] Contract test for GET /resolucao-problemas/projetos/:id in tests/contract/resolucao-problemas/projetoService.contract.test.ts (verify detailed response with relationships)
- [ ] T063 [P] [US4] Integration test for project details view in tests/integration/resolucao-problemas/visualizar-detalhes.spec.ts (E2E: click project → verify all sections visible)

### Implementation for User Story 4

#### Service Layer

- [X] T064 [US4] Implement projetoService.buscarPorId() function in src/features/resolucao-problemas/services/projetoService.ts (GET /api/v1/resolucao-problemas/projetos/:id)

#### Hooks

- [X] T065 [US4] Implement useProjeto query hook in src/features/resolucao-problemas/hooks/useProjeto.ts (TanStack Query for single project)
- [X] T066 [US4] Implement useProjetoProgress hook in src/features/resolucao-problemas/hooks/useProjetoProgress.ts (calculate progress percentage)

#### Components

- [X] T067 [P] [US4] Create ProjetoDetalhes component in src/features/resolucao-problemas/components/projeto/ProjetoDetalhes.tsx (main details view)
- [X] T068 [P] [US4] Create ProjetoProgress component in src/features/resolucao-problemas/components/projeto/ProjetoProgress.tsx (progress indicator)
- [X] T069 [P] [US4] Create EtapasList component in src/features/resolucao-problemas/components/etapa/EtapasList.tsx (list of workflow stages)
- [X] T070 [P] [US4] Create EtapaCard component in src/features/resolucao-problemas/components/etapa/EtapaCard.tsx (individual stage card)
- [X] T071 [P] [US4] Create EtapaTimeline component in src/features/resolucao-problemas/components/etapa/EtapaTimeline.tsx (timeline visual)
- [X] T072 [P] [US4] Create EtapaStepper component in src/features/resolucao-problemas/components/etapa/EtapaStepper.tsx (stepper progress)
- [X] T073 [P] [US4] Create ProgressBar component in src/features/resolucao-problemas/components/shared/ProgressBar.tsx (progress bar UI)

#### Pages

- [X] T074 [US4] Create ProjetoDetalhesPage component in src/features/resolucao-problemas/pages/ProjetoDetalhesPage.tsx (route /projetos/:id)

#### Routing

- [X] T075 [US4] Add /projetos/:id route to React Router configuration

#### Unit Tests

- [ ] T076 [P] [US4] Unit test for ProjetoDetalhes component in tests/unit/resolucao-problemas/ProjetoDetalhes.test.tsx
- [ ] T077 [P] [US4] Unit test for useProjetoProgress hook in tests/unit/resolucao-problemas/useProjetoProgress.test.ts

**Checkpoint**: At this point, User Stories 1-4 work - create, define, list, and view details

---

## Phase 7: User Story 5 - Editar Projeto Existente (Priority: P2)

**Goal**: Permitir que usuários atualizem informações básicas do projeto (EXCETO metodologia que é imutável)

**Independent Test**: Abrir projeto, modificar campos editáveis (título, descrição, responsável), salvar e verificar que alterações são persistidas

### Tests for User Story 5 (write before implementation) ⚠️

- [ ] T078 [P] [US5] Contract test for PUT /resolucao-problemas/projetos/:id in tests/contract/resolucao-problemas/projetoService.contract.test.ts (verify metodologia is excluded)
- [ ] T079 [P] [US5] Integration test for edit project flow in tests/integration/resolucao-problemas/editar-projeto.spec.ts (E2E: open project → click edit → modify → save → verify changes)

### Implementation for User Story 5

#### Service Layer

- [ ] T080 [US5] Implement projetoService.atualizar() function in src/features/resolucao-problemas/services/projetoService.ts (PUT /api/v1/resolucao-problemas/projetos/:id)

#### Hooks

- [ ] T081 [US5] Implement useUpdateProjeto mutation hook in src/features/resolucao-problemas/hooks/useProjeto.ts (TanStack Query mutation)

#### Components

- [ ] T082 [US5] Update ProjetoForm component to support edit mode in src/features/resolucao-problemas/components/projeto/ProjetoForm.tsx (add isEditMode prop, disable metodologia field)
- [ ] T083 [US5] Update ProjetoDetalhes component to add Edit button in src/features/resolucao-problemas/components/projeto/ProjetoDetalhes.tsx

#### Unit Tests

- [ ] T084 [P] [US5] Unit test for ProjetoForm in edit mode in tests/unit/resolucao-problemas/ProjetoForm.test.tsx (verify metodologia is disabled)
- [ ] T085 [P] [US5] Unit test for projetoUpdateSchema validator in tests/unit/resolucao-problemas/projetoValidator.test.ts

**Checkpoint**: At this point, User Stories 1-5 work - full CRUD except archive

---

## Phase 8: User Story 6 - Arquivar Projeto (Priority: P3)

**Goal**: Permitir que usuários arquivem projetos cancelados/descontinuados, removendo da visualização principal mas mantendo histórico

**Independent Test**: Selecionar projeto, executar arquivamento com justificativa, verificar que não aparece mais na listagem padrão mas pode ser recuperado com filtro

### Tests for User Story 6 (write before implementation) ⚠️

- [ ] T086 [P] [US6] Contract test for PUT /resolucao-problemas/projetos/:id/arquivar in tests/contract/resolucao-problemas/projetoService.contract.test.ts
- [ ] T087 [P] [US6] Integration test for archive project flow in tests/integration/resolucao-problemas/arquivar-projeto.spec.ts (E2E: select project → archive → verify removed from default list)

### Implementation for User Story 6

#### Service Layer

- [ ] T088 [US6] Implement projetoService.arquivar() function in src/features/resolucao-problemas/services/projetoService.ts (PUT /api/v1/resolucao-problemas/projetos/:id/arquivar)

#### Hooks

- [ ] T089 [US6] Implement useArquivarProjeto mutation hook in src/features/resolucao-problemas/hooks/useProjeto.ts (TanStack Query mutation)

#### Components

- [ ] T090 [US6] Create ArquivarProjetoModal component in src/features/resolucao-problemas/components/projeto/ArquivarProjetoModal.tsx (modal with justification field)
- [ ] T091 [US6] Update ProjetoDetalhes component to add Archive button in src/features/resolucao-problemas/components/projeto/ProjetoDetalhes.tsx
- [ ] T092 [US6] Update ProjetoList component to support "incluir_arquivados" filter in src/features/resolucao-problemas/components/projeto/ProjetoList.tsx

#### Unit Tests

- [ ] T093 [P] [US6] Unit test for ArquivarProjetoModal validation in tests/unit/resolucao-problemas/ArquivarProjetoModal.test.tsx

**Checkpoint**: All 6 user stories are now complete - full CRUD including archive

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

### Error Handling

- [ ] T094 [P] Add toast notifications for success/error states across all mutations
- [ ] T095 [P] Add loading states and skeletons for all queries
- [ ] T096 [P] Add error boundaries for component error handling

### Performance

- [ ] T097 [P] Add React.memo to ProjetoCard for list performance
- [ ] T098 [P] Add debounce to search input in ProjetoList
- [ ] T099 [P] Optimize re-renders in ProjetoForm with useCallback

### Accessibility

- [ ] T100 [P] Add ARIA labels to all interactive elements
- [ ] T101 [P] Add keyboard navigation support to ProjetoList
- [ ] T102 [P] Ensure all forms are screen-reader friendly

### Documentation

- [ ] T103 [P] Add JSDoc comments to all public API exports in src/features/resolucao-problemas/index.ts
- [ ] T104 [P] Update README with feature overview and usage examples
- [ ] T105 [P] Validate quickstart.md instructions by following them exactly

### Code Quality

- [ ] T106 [P] Run ESLint and fix all warnings
- [ ] T107 [P] Run TypeScript type-check and resolve any errors
- [ ] T108 [P] Format all code with Prettier
- [ ] T109 [P] Review and refactor duplicated code into shared utilities

### Final Validation

- [ ] T110 Run full test suite (contract + integration + unit) and ensure all tests pass
- [ ] T111 Build production bundle and verify no build errors
- [ ] T112 Test all 6 user stories end-to-end in production-like environment
- [ ] T113 Verify Constitution compliance (API-First, Test-First, Feature-Modular, Anti-Entropy, Spec-Driven)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Polish (Phase 9)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories (but logically uses projects created by US1)
- **User Story 3 (P1)**: Can start after Foundational - No dependencies on other stories (but displays projects from US1/US2)
- **User Story 4 (P2)**: Can start after Foundational - No dependencies (uses service layer from US3)
- **User Story 5 (P2)**: Can start after Foundational - Reuses ProjetoForm from US1
- **User Story 6 (P3)**: Can start after Foundational - No dependencies

### Within Each User Story

- Tests MUST be written and FAIL before implementation (RED → GREEN → REFACTOR)
- Types before services
- Services before hooks
- Hooks before components
- Components before pages
- Pages before routing
- Unit tests can run in parallel with integration tests

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel

**Phase 2 (Foundational)**:
- T006, T007, T008 (enums) can run in parallel
- T013, T014, T015 (interfaces) can run in parallel
- T016, T017, T018, T019, T020 (API types) can run in parallel
- T021, T022, T023 (validators) can run in parallel

**User Story 1**:
- T028, T029 (tests) can run in parallel
- T032, T033, T034 (components) can run in parallel
- T038, T039 (unit tests) can run in parallel

**User Story 2**:
- T040, T041 (tests) can run in parallel
- T044, T045 (components) can run in parallel
- T048, T049 (unit tests) can run in parallel

**User Story 3**:
- T050, T051 (tests) can run in parallel
- T054, T055, T056 (components) can run in parallel
- T060, T061 (unit tests) can run in parallel

**User Story 4**:
- T062, T063 (tests) can run in parallel
- T067, T068, T069, T070, T071, T072, T073 (components) can run in parallel
- T076, T077 (unit tests) can run in parallel

**User Story 5**:
- T078, T079 (tests) can run in parallel
- T084, T085 (unit tests) can run in parallel

**User Story 6**:
- T086, T087 (tests) can run in parallel

**Phase 9 (Polish)**:
- T094, T095, T096 (error handling) can run in parallel
- T097, T098, T099 (performance) can run in parallel
- T100, T101, T102 (accessibility) can run in parallel
- T103, T104, T105 (documentation) can run in parallel
- T106, T107, T108, T109 (code quality) can run in parallel

**Cross-Phase Parallelism**:
- Once Phase 2 (Foundational) is complete, ALL 6 user stories (Phases 3-8) can run in parallel if team capacity allows

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T028: "Contract test for POST /resolucao-problemas/projetos"
Task T029: "Integration test for create project flow"

# Launch all independent components for User Story 1 together:
Task T032: "Create ProjetoForm component"
Task T033: "Create ClienteAutocomplete component"
Task T034: "Create UserSelector component"

# Launch all unit tests for User Story 1 together:
Task T038: "Unit test for ProjetoForm validation"
Task T039: "Unit test for projetoCreateSchema validator"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - All P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T027) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 - Create Project (T028-T039)
4. Complete Phase 4: User Story 2 - Define Methodology (T040-T049)
5. Complete Phase 5: User Story 3 - List Projects (T050-T061)
6. **STOP and VALIDATE**: Test all 3 P1 stories independently
7. Run Phase 9 (Polish) tasks: T094-T113
8. Deploy/demo MVP

**MVP Delivers**:
- ✅ Create projects without methodology
- ✅ Define methodology (MASP/8D/A3) with auto-generated stages
- ✅ List and filter projects
- ✅ Complete test coverage (contract + integration + unit)

### Incremental Delivery (All 6 Stories)

1. Complete Setup + Foundational → Foundation ready
2. Add User Stories 1, 2, 3 (P1) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 4 (P2) → Test independently → Deploy/Demo
4. Add User Story 5 (P2) → Test independently → Deploy/Demo
5. Add User Story 6 (P3) → Test independently → Deploy/Demo
6. Complete Phase 9 (Polish) → Final validation → Production release

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T027)
2. **Once Foundational is done**, split work:
   - **Developer A**: User Story 1 (T028-T039)
   - **Developer B**: User Story 2 (T040-T049)
   - **Developer C**: User Story 3 (T050-T061)
3. **After P1 stories complete**:
   - **Developer A**: User Story 4 (T062-T077)
   - **Developer B**: User Story 5 (T078-T085)
   - **Developer C**: User Story 6 (T086-T093)
4. **All developers**: Phase 9 (Polish) tasks in parallel
5. Stories integrate independently without conflicts

---

## Task Summary

**Total Tasks**: 113
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 22 tasks
- Phase 3 (User Story 1 - P1): 12 tasks
- Phase 4 (User Story 2 - P1): 10 tasks
- Phase 5 (User Story 3 - P1): 12 tasks
- Phase 6 (User Story 4 - P2): 16 tasks
- Phase 7 (User Story 5 - P2): 8 tasks
- Phase 8 (User Story 6 - P3): 8 tasks
- Phase 9 (Polish): 20 tasks

**Parallel Opportunities**: 63 tasks marked [P] can run in parallel (55.8%)

**MVP Scope** (Recommended): User Stories 1, 2, 3 (P1) = 5 + 22 + 12 + 10 + 12 = 61 tasks

**Test Coverage**:
- Contract tests: 6 (one per user story)
- Integration tests: 6 (one per user story)
- Unit tests: 12 (critical validators and components)
- Total: 24 tests ensuring comprehensive coverage

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story is independently completable and testable
- **Test-first approach**: RED (tests fail) → GREEN (implement) → REFACTOR
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Methodology immutability** is enforced in US5 (projetoUpdateSchema excludes metodologia)
- **Feature-modular architecture** keeps all code in `src/features/resolucao-problemas/`
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
