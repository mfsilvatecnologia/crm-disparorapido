# Tasks: Sistema de Enriquecimento de Dados

**Input**: Design documents from `/specs/001-enriquecimento-dados/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Contract + integration tests must be written first (fail) for each story. Use `npm run test:contract`, `npm run test:integration`, `npm run test:run`, plus `npm run lint` and `npm run build`.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Parallelizable (different files, no blocking deps)
- **[Story]**: Story label ([US1]..[US4])
- Include exact file paths

## Phase 1: Setup (Shared Infrastructure)
**Purpose**: Prepare feature workspace and module scaffold.
- [X] T001 Create feature module scaffold `src/features/enrichment/{components,pages,services,hooks,types,lib}` and barrel `src/features/enrichment/index.ts`.
- [X] T002 [P] Add feature route registration placeholder `src/features/enrichment/pages/routes.tsx` (no UI yet).

---

## Phase 2: Foundational (Blocking Prerequisites)
**Purpose**: Core infra required before any story.
- [X] T003 [P] Create typed API client shell from contracts `src/features/enrichment/services/apiClient.ts` (base URLs, auth headers, error mapping).
- [X] T004 [P] Define domain types/enums from data-model `src/features/enrichment/types/enrichment.ts` (jobs, results, providers, investigations, stats).
- [X] T005 [P] Add polling/backoff utility `src/features/enrichment/lib/polling.ts` (3s/5s intervals, 1s→2s→4s retry, max 3).
- [X] T006 [P] Add query keys/selectors `src/features/enrichment/lib/queryKeys.ts` for enrichment, investigation, providers, stats.
- [X] T007 [P] Add notification helpers `src/features/enrichment/lib/notifications.ts` (success/error/partial), wired to existing toast system.

**Checkpoint**: Foundation ready; proceed to story phases.

---

## Phase 3: User Story 1 - Enriquecer Lead com Dados Externos (Priority: P1) 🎯 MVP
**Goal**: Permitir iniciar enriquecimento, exibir custo estimado, progresso por provider, resultados e notificações (incluindo parcial/erro).
**Independent Test**: Iniciar enriquecimento de um lead com >=1 provider ativo e verificar resultados/parciais com polling 3s e notificações em até 2s após conclusão.

### Tests (write first; must fail initially)
- [ ] T008 [P] [US1] Contract test start/status enrichment `tests/contract/enrichment/enrichment.contract.test.ts` (POST /enrichments, GET /enrichments/{id}).
- [ ] T009 [P] [US1] Integration test lead enrichment flow `tests/integration/enrichment/enrichment.integration.test.ts` (select providers → confirm custo → polling → resultados/partial).

### Implementation
- [X] T010 [P] [US1] Implement enrichment API client `src/features/enrichment/services/enrichmentApi.ts` (start job, fetch status/results).
- [X] T011 [P] [US1] Provider selector + cost estimate UI `src/features/enrichment/components/ProviderSelector.tsx` and `src/features/enrichment/components/EnrichmentCostCard.tsx` (disable when zero providers; saldo check).
- [X] T012 [US1] Polling/progress hook `src/features/enrichment/hooks/useEnrichmentJob.ts` using `polling.ts` (stop on completed/error, partial handling).
- [X] T013 [US1] Lead enrichment page `src/features/enrichment/pages/LeadEnrichmentPage.tsx` wiring selector, cost, progress, results with confidence/custo.
- [X] T014 [US1] Notifications for success/partial/error `src/features/enrichment/components/EnrichmentNotifications.tsx` (toast + background completion when user leaves).

**Checkpoint**: US1 independently demoable.

---

## Phase 4: User Story 2 - Investigação de Mídia Negativa (Priority: P2)
**Goal**: Iniciar investigação, exibir custo/tempo estimado, polling 5s, dashboard com distribuição, risk score, lista de fontes.
**Independent Test**: Criar investigação para dossiê existente, ver polling 5s com backoff, dashboard final com gauge e lista filtrável.

### Tests (write first; must fail initially)
- [ ] T015 [P] [US2] Contract test start/status investigation `tests/contract/enrichment/investigation.contract.test.ts` (POST/GET /investigations).
- [ ] T016 [P] [US2] Integration test investigation flow `tests/integration/enrichment/investigation.integration.test.ts` (confirm custo/tempo → polling → dashboard distribuição/gauge/fontes).

### Implementation
- [X] T017 [P] [US2] Investigation API client `src/features/enrichment/services/investigationApi.ts` (start, status, sources mapping).
- [X] T018 [P] [US2] Dashboard components `src/features/enrichment/components/InvestigationDashboard.tsx` (gauge 0-100, distribution chart, filters).
- [X] T019 [US2] Polling hook `src/features/enrichment/hooks/useInvestigation.ts` (stop on completed/failed, empty-state messaging).
- [X] T020 [US2] Investigation page `src/features/enrichment/pages/InvestigationPage.tsx` with modal de confirmação (custo/tempo) e estado vazio "Nenhuma fonte encontrada".

**Checkpoint**: US2 independently demoable.

---

## Phase 5: User Story 3 - Configuração de Providers (Administrador) (Priority: P3)
**Goal**: Administrar providers (tabela, toggle enable/disable, editar prioridade/rate limit, health badges, notificações de sucesso/erro).
**Independent Test**: Acessar página admin, alterar status/prioridade, ver persistência imediata e validação (priority/rateLimit > 0).

### Tests (write first; must fail initially)
- [ ] T021 [P] [US3] Contract test providers list/update `tests/contract/enrichment/providers.contract.test.ts` (GET /providers, PATCH /providers/{id}).
- [ ] T022 [P] [US3] Integration test admin providers page `tests/integration/enrichment/providers.integration.test.ts` (toggle, editar modal, badges de health).

### Implementation
- [X] T023 [P] [US3] Providers API client `src/features/enrichment/services/providersApi.ts` (list, patch enabled/priority/rateLimit).
- [X] T024 [P] [US3] Provider table with badges/toggles `src/features/enrichment/components/ProviderTable.tsx` (health colors, inline toggle optimistic update).
- [X] T025 [US3] Provider edit modal `src/features/enrichment/components/ProviderEditModal.tsx` (RHF+Zod validation priority>0 rateLimit>0, error/success toasts).
- [X] T026 [US3] Admin page `src/features/enrichment/pages/ProviderAdminPage.tsx` wiring table+modal and immediate refresh.

**Checkpoint**: US3 independently demoable.

---

## Phase 6: User Story 4 - Dashboard de Estatísticas de Enriquecimento (Administrador) (Priority: P4)
**Goal**: Dashboard com filtros de período/provider, cards, gráficos de custo/sucesso, tabela detalhada com cores semânticas.
**Independent Test**: Selecionar períodos/filtros e ver métricas atualizadas; cards, gráficos e tabela refletem dados e cores de sucesso.

### Tests (write first; must fail initially)
- [ ] T027 [P] [US4] Contract test stats endpoint `tests/contract/enrichment/stats.contract.test.ts` (GET /stats/enrichment com filtros).
- [ ] T028 [P] [US4] Integration test stats dashboard `tests/integration/enrichment/stats.integration.test.ts` (filtros → auto-refresh → cards/gráficos/tabela com cores p/ sucesso >=95%).

### Implementation
- [X] T029 [P] [US4] Stats API client `src/features/enrichment/services/statsApi.ts` (range/provider params, BRL formatting, durations 1 decimal).
- [X] T030 [P] [US4] Charts components `src/features/enrichment/components/StatsCharts.tsx` (bar custo/provider, bar taxa sucesso/provider, semantic colors).
- [X] T031 [US4] Stats page `src/features/enrichment/pages/EnrichmentStatsPage.tsx` (date range picker default 7d, provider filter, cards, table with avg duration).

**Checkpoint**: US4 independently demoable.

---

## Phase 7: Polish & Cross-Cutting
- [X] T032 [P] Harden empty/error states and tooltips `src/features/enrichment/components/*` (no providers, saldo insuficiente, retry CTA após 3 falhas de polling).
- [X] T033 [P] Update docs/quickstart `specs/001-enriquecimento-dados/quickstart.md` with any new commands/paths.
- [X] T034 Run full validation: `npm run lint` && `npm run build` && `npm run test:contract` && `npm run test:integration` && `npm run test:run`.

---

## Dependencies & Execution Order
- Phase 1 → Phase 2 (blocking). Stories (Phases 3–6) depend on Phase 2 completion; stories can run in parallel after Phase 2.
- Story priority order: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4); maintain independence but respect priorities for MVP.

## Parallel Opportunities
- Tasks marked [P] are parallel-safe (distinct files, no sequencing). Different stories can proceed in parallel after Phase 2.

## Implementation Strategy
- MVP: Complete Phase 1–2, then Phase 3 (US1) and validate SC-001..SC-004.
- Incremental: Add US2 (investigação), then US3 (admin providers), then US4 (stats), validating each independently with contract+integration suites.
