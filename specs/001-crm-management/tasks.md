# Tasks: Sistema de Gestão CRM

**Input**: Design documents from `/specs/001-crm-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Contract + integration tests are expected before implementation for any API/critical flow.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths assume single project structure at repository root
- `src/` for source code
- `tests/` for all test files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared infrastructure for all CRM features

- [X] T001 Review existing project structure and identify shared components in src/shared/
- [X] T002 [P] Create shared CRM formatters in src/shared/lib/crm/formatters.ts
- [X] T003 [P] Create shared Timeline component in src/shared/components/Timeline.tsx
- [X] T004 [P] Create shared DataTable component in src/shared/components/DataTable.tsx
- [X] T005 [P] Create shared EmptyState component in src/shared/components/EmptyState.tsx
- [X] T006 [P] Create shared ConfirmDialog component in src/shared/components/ConfirmDialog.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Verify API client configuration in src/lib/api-client.ts supports all CRM endpoints
- [X] T008 [P] Configure TanStack Query defaults for CRM features in query client setup
- [X] T009 [P] Verify routing structure supports /crm/* paths in app router configuration
- [X] T010 [P] Setup test environment configuration for contract tests in vitest.config.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Gerenciar Oportunidades de Clientes (Priority: P1) 🎯 MVP

**Goal**: Habilitar representantes de vendas a rastrear oportunidades desde contato inicial até conversão (ganho/perda), fornecendo pipeline de vendas completo.

**Independent Test**: Criar oportunidade, atualizar estágio, marcar como ganha (verifica criação de cliente), marcar outra como perdida. Aplicar filtros e verificar paginação.

### Tests for User Story 1 (write before implementation) ⚠️

> **NOTE: Teste de contrato já existe em contracts/opportunities.contract.ts - executar para verificar conformidade**

-- [ ] T011 [P] [US1] Execute contract test for Opportunities API in specs/001-crm-management/contracts/opportunities.contract.ts
- [X] T012 [P] [US1] Create integration test for opportunity-to-customer conversion in tests/integration/crm/opportunity-to-customer.test.tsx

### Implementation for User Story 1

- [X] T013 [P] [US1] Create Opportunity types in src/features/opportunities/types/opportunity.ts
- [X] T014 [P] [US1] Create opportunity validation schemas in src/features/opportunities/lib/validations.ts
- [X] T015 [P] [US1] Create opportunity constants in src/features/opportunities/lib/constants.ts
- [X] T016 [US1] Implement useOpportunities hook with infinite query in src/features/opportunities/api/opportunities.ts
- [X] T017 [US1] Implement useCreateOpportunity mutation in src/features/opportunities/api/opportunities.ts
- [X] T018 [US1] Implement useUpdateOpportunity mutation in src/features/opportunities/api/opportunities.ts
- [X] T019 [US1] Implement useWinOpportunity mutation in src/features/opportunities/api/opportunities.ts
- [X] T020 [US1] Implement useLoseOpportunity mutation in src/features/opportunities/api/opportunities.ts
- [X] T021 [US1] Implement useOpportunity query for single opportunity in src/features/opportunities/api/opportunities.ts
- [X] T022 [P] [US1] Create OpportunityForm component in src/features/opportunities/components/OpportunityForm.tsx
- [X] T023 [P] [US1] Create OpportunityList component with infinite scroll in src/features/opportunities/components/OpportunityList.tsx
- [X] T024 [P] [US1] Create OpportunityDetail component in src/features/opportunities/components/OpportunityDetail.tsx
- [X] T025 [P] [US1] Create OpportunityPipeline visual component in src/features/opportunities/components/OpportunityPipeline.tsx
- [X] T026 [P] [US1] Create WinOpportunityDialog component in src/features/opportunities/components/WinOpportunityDialog.tsx
- [X] T027 [P] [US1] Create LoseOpportunityDialog component in src/features/opportunities/components/LoseOpportunityDialog.tsx
- [X] T028 [P] [US1] Create useOpportunityFilters hook in src/features/opportunities/hooks/useOpportunityFilters.ts
- [X] T029 [US1] Implement OpportunitiesPage with filters and list in src/features/opportunities/pages/OpportunitiesPage.tsx
- [X] T030 [US1] Implement OpportunityDetailPage with full details in src/features/opportunities/pages/OpportunityDetailPage.tsx
- [X] T031 [US1] Create public API exports in src/features/opportunities/index.ts
- [X] T032 [US1] Add opportunities routes to app router (/crm/opportunities, /crm/opportunities/:id)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create, update, filter opportunities and convert to customers

---

## Phase 4: User Story 2 - Gerenciar Informações de Clientes (Priority: P2)

**Goal**: Habilitar gerentes de conta a manter perfis de clientes com informações completas, status tracking e linha do tempo histórica para serviço personalizado.

**Independent Test**: Visualizar lista de clientes, acessar detalhes, atualizar informações, alterar status, verificar timeline e health score. Aplicar filtros por status e segmento.

### Tests for User Story 2 (write before implementation) ⚠️

- [X] T033 [P] [US2] Create contract test for Customers API in specs/001-crm-management/contracts/customers.contract.ts
- [X] T034 [P] [US2] Create integration test for customer management flow in tests/integration/crm/customer-management.test.tsx

### Implementation for User Story 2

- [X] T035 [P] [US2] Create Customer types in src/features/customers/types/customer.ts
- [X] T036 [P] [US2] Create Timeline event types in src/features/customers/types/timeline.ts
- [X] T037 [P] [US2] Create customer validation schemas in src/features/customers/lib/validations.ts
- [X] T038 [P] [US2] Create customer constants in src/features/customers/lib/constants.ts
- [X] T039 [US2] Implement useCustomers hook with infinite query in src/features/customers/api/customers.ts
- [X] T040 [US2] Implement useCustomer query for single customer in src/features/customers/api/customers.ts
- [X] T041 [US2] Implement useUpdateCustomer mutation in src/features/customers/api/customers.ts
- [X] T042 [US2] Implement useUpdateCustomerStatus mutation in src/features/customers/api/customers.ts
- [X] T043 [US2] Implement useCustomerTimeline query in src/features/customers/api/customers.ts
- [X] T044 [US2] Implement useHealthScore query in src/features/customers/api/customers.ts
- [X] T045 [P] [US2] Create CustomerForm component in src/features/customers/components/CustomerForm.tsx
- [X] T046 [P] [US2] Create CustomerList component with filters in src/features/customers/components/CustomerList.tsx
- [X] T047 [P] [US2] Create CustomerDetail component in src/features/customers/components/CustomerDetail.tsx
- [X] T048 [P] [US2] Create CustomerTimeline component using shared Timeline in src/features/customers/components/CustomerTimeline.tsx
- [X] T049 [P] [US2] Create HealthScoreBadge component in src/features/customers/components/HealthScoreBadge.tsx
- [X] T050 [P] [US2] Create StatusChangeDialog component in src/features/customers/components/StatusChangeDialog.tsx
- [X] T051 [P] [US2] Create useCustomerFilters hook in src/features/customers/hooks/useCustomerFilters.ts
- [X] T052 [US2] Implement CustomersPage with filters and list in src/features/customers/pages/CustomersPage.tsx
- [X] T053 [US2] Implement CustomerDetailPage with tabs (overview, timeline, contacts, activities, contracts) in src/features/customers/pages/CustomerDetailPage.tsx
- [X] T054 [US2] Create public API exports in src/features/customers/index.ts
- [X] T055 [US2] Add customers routes to app router (/crm/customers, /crm/customers/:id)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - customers created from opportunities appear in customer list with full management capabilities

---

## Phase 5: User Story 3 - Gerenciar Contatos de Clientes (Priority: P3)

**Goal**: Habilitar equipes a manter múltiplos pontos de contato por cliente (contato principal, tomadores de decisão, líderes técnicos) para comunicação eficaz.

**Independent Test**: Adicionar contato a cliente, marcar como principal, atualizar informações, adicionar mais contatos, trocar contato principal, remover contato não-principal.

### Tests for User Story 3 (write before implementation) ⚠️

- [X] T056 [P] [US3] Create contract test for Contacts API in specs/001-crm-management/contracts/contacts.contract.ts
- [X] T057 [P] [US3] Create integration test for contact management in tests/integration/crm/contact-management.test.tsx

### Implementation for User Story 3

- [X] T058 [P] [US3] Create Contact types in src/features/contacts/types/contact.ts
- [X] T059 [P] [US3] Create contact validation schemas in src/features/contacts/lib/validations.ts
- [X] T060 [US3] Implement useContacts query in src/features/contacts/api/contacts.ts
- [X] T061 [US3] Implement useCreateContact mutation in src/features/contacts/api/contacts.ts
- [X] T062 [US3] Implement useUpdateContact mutation in src/features/contacts/api/contacts.ts
- [X] T063 [US3] Implement useDeleteContact mutation in src/features/contacts/api/contacts.ts
- [X] T064 [US3] Implement useSetPrimaryContact mutation in src/features/contacts/api/contacts.ts
- [X] T065 [P] [US3] Create ContactForm component in src/features/contacts/components/ContactForm.tsx
- [X] T066 [P] [US3] Create ContactList component in src/features/contacts/components/ContactList.tsx
- [X] T067 [P] [US3] Create ContactCard component with primary badge in src/features/contacts/components/ContactCard.tsx
- [X] T068 [US3] Create public API exports in src/features/contacts/index.ts
- [X] T069 [US3] Integrate ContactList into CustomerDetailPage tabs

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - customer profiles show contact management with primary contact designation

---

## Phase 6: User Story 4 - Rastrear Atividades de Clientes (Priority: P4)

**Goal**: Habilitar equipes a registrar e revisar todas interações com clientes (chamadas, reuniões, emails, notas) para manter contexto e garantir continuidade.

**Independent Test**: Registrar atividade para cliente (chamada, reunião, email, nota), visualizar histórico ordenado, editar atividade, excluir atividade, verificar timeline integrada.

### Tests for User Story 4 (write before implementation) ⚠️

- [X] T070 [P] [US4] Create contract test for Activities API in specs/001-crm-management/contracts/activities.contract.ts
- [X] T071 [P] [US4] Create integration test for activity tracking in tests/integration/crm/activity-tracking.test.tsx

### Implementation for User Story 4

- [X] T072 [P] [US4] Create Activity types in src/features/activities/types/activity.ts
- [X] T073 [P] [US4] Create activity validation schemas in src/features/activities/lib/validations.ts
- [X] T074 [P] [US4] Create activity constants (types, icons) in src/features/activities/lib/constants.ts
- [X] T075 [US4] Implement useActivities query in src/features/activities/api/activities.ts
- [X] T076 [US4] Implement useCreateActivity mutation in src/features/activities/api/activities.ts
- [X] T077 [US4] Implement useUpdateActivity mutation in src/features/activities/api/activities.ts
- [X] T078 [US4] Implement useDeleteActivity mutation in src/features/activities/api/activities.ts
- [X] T079 [P] [US4] Create ActivityForm component with type selector in src/features/activities/components/ActivityForm.tsx
- [X] T079a [US4] Implement auto-save debouncing (300ms) in ActivityForm to prevent data loss
- [X] T080 [P] [US4] Create ActivityList component in src/features/activities/components/ActivityList.tsx
- [X] T081 [P] [US4] Create ActivityCard component with type icons in src/features/activities/components/ActivityCard.tsx
- [X] T082 [US4] Create public API exports in src/features/activities/index.ts
- [X] T083 [US4] Integrate ActivityList into CustomerDetailPage tabs
- [X] T084 [US4] Integrate activities into CustomerTimeline component

**Checkpoint**: At this point, User Stories 1-4 all work independently - customer profiles show complete activity history with timeline integration

---

## Phase 7: User Story 5 - Gerenciar Contratos de Clientes (Priority: P5)

**Goal**: Habilitar gerentes de conta a rastrear contratos incluindo termos, datas de renovação e valores para gerenciar proativamente renovações e prevenir cancelamentos.

**Independent Test**: Criar contrato para cliente, visualizar detalhes, acessar dashboard de renovações (próximos 90 dias), renovar contrato, editar termos, verificar timeline integrada.

### Tests for User Story 5 (write before implementation) ⚠️

- [X] T085 [P] [US5] Create contract test for Contracts API in specs/001-crm-management/contracts/contracts.contract.ts
- [X] T086 [P] [US5] Create integration test for contract renewal flow in tests/integration/crm/contract-renewal.test.tsx

### Implementation for User Story 5

- [X] T087 [P] [US5] Create Contract types in src/features/contracts/types/contract.ts
- [X] T088 [P] [US5] Create contract validation schemas in src/features/contracts/lib/validations.ts
- [X] T089 [P] [US5] Create contract constants (billing cycles, statuses) in src/features/contracts/lib/constants.ts
- [X] T090 [US5] Implement useContracts query in src/features/contracts/api/contracts.ts
- [X] T091 [US5] Implement useCreateContract mutation in src/features/contracts/api/contracts.ts
- [X] T092 [US5] Implement useUpdateContract mutation in src/features/contracts/api/contracts.ts
- [X] T093 [US5] Implement useNearRenewal query in src/features/contracts/api/contracts.ts
- [X] T094 [US5] Implement useRenewContract mutation in src/features/contracts/api/contracts.ts
- [X] T095 [P] [US5] Create ContractForm component in src/features/contracts/components/ContractForm.tsx
- [X] T096 [P] [US5] Create ContractList component in src/features/contracts/components/ContractList.tsx
- [X] T097 [P] [US5] Create ContractCard component with status badges in src/features/contracts/components/ContractCard.tsx
- [X] T098 [P] [US5] Create RenewalDashboard component in src/features/contracts/components/RenewalDashboard.tsx
- [X] T099 [P] [US5] Create RenewContractDialog component in src/features/contracts/components/RenewContractDialog.tsx
- [X] T100 [US5] Implement RenewalsPage with filters in src/features/contracts/pages/RenewalsPage.tsx
- [X] T101 [US5] Create public API exports in src/features/contracts/index.ts
- [X] T102 [US5] Integrate ContractList into CustomerDetailPage tabs
- [X] T103 [US5] Integrate contract events into CustomerTimeline component
- [X] T104 [US5] Add renewals route to app router (/crm/renewals)

**Checkpoint**: All 5 user stories are now complete and independently functional - full CRM system operational

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T105 [P] Update quickstart.md with implementation examples in specs/001-crm-management/quickstart.md
- [X] T105a [P] Update AppSidebar navigation menu in src/shared/components/layout/AppSidebar.tsx:
  - Add new "CRM" section group after "Principal"
  - Add Oportunidades menu item (/crm/opportunities) with Target icon
  - Add Clientes menu item (/crm/customers) with Users icon
  - Add Contratos menu item (/crm/contracts) with FileText icon (when US5 complete)
  - Add Renovações menu item (/crm/renewals) with CalendarClock icon (when US5 complete)
  - Configure requiredFeature: 'enableCRM' for all CRM items
  - Wrap section with FeatureGuard for 'enableCRM'
  - Ensure tenant feature flags include enableCRM for visibility
- [X] T106 [P] Implement error handling patterns across all CRM features:
  - Error toast notifications for API mutations (create, update, delete)
  - Network timeout handling with retry options (via TanStack Query)
  - Optimistic update rollback on failure
  - Error boundaries for page-level crashes
  - Loading skeletons for all list and detail views
- [ ] T107 [P] Verify responsive design (375px+) for all CRM components
- [X] T108 [P] Add accessibility attributes (ARIA labels, keyboard navigation) across CRM features
- [X] T108a [P] Reorganize test files to colocate with features (move from specs/contracts, tests/ to src/features/**/__tests__/)
- [ ] T109 Run all contract tests and verify 100% pass rate
- [ ] T110 Run all integration tests and verify complete user journeys
- [ ] T111 [P] Performance optimization: verify infinite scroll handles 10,000+ records
- [X] T112 [P] Verify filter persistence using URL query params across all features
- [ ] T113 Code review and refactoring for consistency across 5 features
- [ ] T114 Run build and verify no TypeScript errors
- [ ] T115 Run linter and fix all violations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Opportunities**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Customers**: Can start after Foundational (Phase 2) - Receives customers from US1 conversions but independently testable
- **User Story 3 (P3) - Contacts**: Can start after Foundational (Phase 2) - Integrates with US2 customer pages but independently testable
- **User Story 4 (P4) - Activities**: Can start after Foundational (Phase 2) - Integrates with US2 timeline but independently testable
- **User Story 5 (P5) - Contracts**: Can start after Foundational (Phase 2) - Integrates with US2 timeline but independently testable

### Within Each User Story

- Contract tests MUST be written/executed and FAIL before implementation (verify API conformance)
- Integration tests should be written before implementation (TDD approach)
- Types and validations before API hooks
- API hooks before components
- Components before pages
- Public API exports after all internal implementation
- Route integration as final step

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks marked [P] (T002-T006) can run in parallel
- **Phase 2 (Foundational)**: Tasks T008, T009, T010 can run in parallel after T007
- **Phase 3-7 (User Stories)**: Once Foundational phase completes, ALL 5 user stories can start in parallel if team capacity allows
- **Within each User Story**:
  - Tests (both contract and integration) can run in parallel
  - Types, validations, and constants can be created in parallel
  - Components within the same story can be built in parallel (different files)
  - Models within a story marked [P] can run in parallel
- **Phase 8 (Polish)**: Tasks T105-T108, T111-T112 can run in parallel

---

## Parallel Example: User Story 1 (Opportunities)

```bash
# Execute contract test first (verify API):
Task T011: "Execute contract test for Opportunities API"

# Launch all foundational files in parallel:
Task T013: "Create Opportunity types in src/features/opportunities/types/opportunity.ts"
Task T014: "Create opportunity validation schemas in src/features/opportunities/lib/validations.ts"
Task T015: "Create opportunity constants in src/features/opportunities/lib/constants.ts"

# After types are ready, launch all components in parallel:
Task T022: "Create OpportunityForm component in src/features/opportunities/components/OpportunityForm.tsx"
Task T023: "Create OpportunityList component in src/features/opportunities/components/OpportunityList.tsx"
Task T024: "Create OpportunityDetail component in src/features/opportunities/components/OpportunityDetail.tsx"
Task T025: "Create OpportunityPipeline visual component in src/features/opportunities/components/OpportunityPipeline.tsx"
Task T026: "Create WinOpportunityDialog component in src/features/opportunities/components/WinOpportunityDialog.tsx"
Task T027: "Create LoseOpportunityDialog component in src/features/opportunities/components/LoseOpportunityDialog.tsx"
```

---

## Parallel Example: Multiple User Stories

```bash
# Once Foundational (Phase 2) is complete, with 5 developers:

Developer A: Phase 3 (US1 - Opportunities) - T011 through T032
Developer B: Phase 4 (US2 - Customers) - T033 through T055
Developer C: Phase 5 (US3 - Contacts) - T056 through T069
Developer D: Phase 6 (US4 - Activities) - T070 through T084
Developer E: Phase 7 (US5 - Contracts) - T085 through T104

# Each story completes independently and can be tested/deployed separately
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T010) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 - Opportunities (T011-T032)
4. **STOP and VALIDATE**: Test US1 independently with contract + integration tests
5. Deploy/demo if ready - functional opportunity management system

**MVP Delivers**: Complete opportunity pipeline from lead to conversion, providing immediate business value for sales teams.

### Incremental Delivery

1. Complete Setup + Foundational (Phases 1-2) → Foundation ready
2. Add User Story 1 - Opportunities (Phase 3) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 - Customers (Phase 4) → Test independently → Deploy/Demo
4. Add User Story 3 - Contacts (Phase 5) → Test independently → Deploy/Demo
5. Add User Story 4 - Activities (Phase 6) → Test independently → Deploy/Demo
6. Add User Story 5 - Contracts (Phase 7) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (recommended after Foundational phase):

1. Team completes Setup + Foundational together (Phases 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Opportunities)
   - Developer B: User Story 2 (Customers)
   - Developer C: User Story 3 (Contacts)
   - Developer D: User Story 4 (Activities)
   - Developer E: User Story 5 (Contracts)
3. Stories complete and integrate independently via public APIs
4. Integration happens naturally through Customer detail page tabs

---

## Task Summary

**Total Tasks**: 117 tasks across 8 phases

**Tasks per User Story**:

- US1 (Opportunities): 22 tasks (T011-T032)
- US2 (Customers): 23 tasks (T033-T055)
- US3 (Contacts): 14 tasks (T056-T069)
- US4 (Activities): 16 tasks (T070-T084)
- US5 (Contracts): 20 tasks (T085-T104)
- Cross-Cutting (Phase 8): 12 tasks (T105-T115, T105a)

**Parallel Opportunities Identified**: 48 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:

- US1: Create/update/convert opportunities independently
- US2: Manage customers with timeline and health scores independently
- US3: Add/update/remove contacts with primary designation independently
- US4: Track activities with timeline integration independently
- US5: Manage contracts with renewal tracking independently

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 - Opportunities only) = 32 tasks

---

## Notes

- [P] tasks = different files, no dependencies, can execute in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Contract tests verify API conformance before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Features communicate only via public API exports (index.ts)
- Shared components promoted to src/shared/ only if used by 3+ features
