# Tasks: Campaign Lead Stages Management Frontend

**Input**: Design documents from `/specs/006-doc-frontend-campaign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-services.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
All paths relative to repository root (`/home/johnny/Documentos/CLIENTES/M-F-SILVA/leadsrapido/leadsrapido_frontend`)

---

## Phase 1: Setup & Foundation (Shared Infrastructure)

**Purpose**: Project initialization and foundational structure that all user stories depend on

- [X] T001 Create feature directory structure at `src/features/campaign-stages/` with subdirectories: components/, hooks/, services/, types/, schemas/, utils/, pages/
- [X] T002 [P] Create types foundation - `src/features/campaign-stages/types/index.ts` with re-exports for all type modules
- [X] T003 [P] Create type definitions in `src/features/campaign-stages/types/stage.types.ts` - CampaignLeadStage, StageCategory, CreateStageRequest, UpdateStageRequest, ReorderStagesRequest
- [X] T004 [P] Create type definitions in `src/features/campaign-stages/types/history.types.ts` - CampaignContactStageHistory, TransitionLeadRequest/Response, BulkStageUpdateRequest/Response
- [X] T005 [P] Create type definitions in `src/features/campaign-stages/types/charge.types.ts` - CampaignStageCharge, ChargeType, ChargeFilters, ChargesSummary
- [X] T006 [P] Create type definitions in `src/features/campaign-stages/types/metrics.types.ts` - FunnelMetrics, StageMetrics
- [X] T007 [P] Create type definitions in `src/features/campaign-stages/types/ui.types.ts` - StageCardData, LeadCardData, KanbanColumn, StageFormState, BulkActionState
- [X] T008 [P] Create constants in `src/features/campaign-stages/types/constants.ts` - STAGE_LIMITS, DEFAULT_STAGE_COLORS, DEFAULT_STAGE_ICONS, STAGE_CATEGORY_LABELS, QUERY_KEYS, CACHE_TIMES
- [X] T009 [P] Create Zod schemas in `src/features/campaign-stages/schemas/stage.schemas.ts` - StageCategorySchema, HexColorSchema, CampaignLeadStageSchema, CreateStageSchema, UpdateStageSchema
- [X] T010 [P] Create Zod schemas in `src/features/campaign-stages/schemas/transition.schemas.ts` - TransitionLeadSchema, CampaignContactStageHistorySchema
- [X] T011 [P] Create utility functions in `src/features/campaign-stages/utils/type-guards.ts` - isInitialStage, isFinalStage, stageChargesCredits, isApiError, hasTransitionWarnings
- [X] T012 [P] Create utility functions in `src/features/campaign-stages/utils/formatters.ts` - formatCentavosToReais, formatDurationHours, formatStageColor
- [X] T013 Create main service layer in `src/features/campaign-stages/services/stages.ts` with all API service functions (fetchCampaignStages, createCampaignStage, updateCampaignStage, deleteCampaignStage, reorderCampaignStages, transitionLeadStage, bulkUpdateLeadStages, fetchLeadStageHistory, fetchCampaignFunnelMetrics, fetchCampaignCharges, fetchCampaignChargesSummary, fetchBillingConfiguration, updateBillingConfiguration)
- [X] T014 Create feature index file `src/features/campaign-stages/index.ts` with public exports

**Checkpoint**: Foundation ready - all types, schemas, utilities, and services defined. User story implementation can now begin in parallel.

---

## Phase 2: User Story 1 - Configure Custom Lead Stages (Priority: P1) 🎯 MVP

**Goal**: Allow sales managers to create, configure, and manage custom lead stages with drag-and-drop reordering

**Independent Test**: Create 3-5 stages with different categories, colors, and icons, reorder via drag-and-drop, verify persistence

### Tests for User Story 1

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

 - [X] T015 [P] [US1] Unit test for fetchCampaignStages in `src/features/campaign-stages/services/stages.test.ts` - test success, error handling, filter parameters
 - [X] T016 [P] [US1] Unit test for createCampaignStage in `src/features/campaign-stages/services/stages.test.ts` - test success, duplicate name error (409), max stages error (400)
 - [X] T017 [P] [US1] Unit test for updateCampaignStage in `src/features/campaign-stages/services/stages.test.ts` - test success, categoria change rejection (400)
 - [X] T018 [P] [US1] Unit test for deleteCampaignStage in `src/features/campaign-stages/services/stages.test.ts` - test success, active leads error (409)
 - [X] T019 [P] [US1] Unit test for reorderCampaignStages in `src/features/campaign-stages/services/stages.test.ts` - test reorder API call
 - [X] T020 [P] [US1] Integration test for stage CRUD workflow in `tests/features/campaign-stages/integration/stage-crud.test.tsx` - create → read → update → delete flow

### React Query Hooks for User Story 1

- [X] T021 [US1] Create hooks in `src/features/campaign-stages/hooks/useStages.ts` - useCampaignStages (query), useCreateCampaignStage (mutation), useUpdateCampaignStage (mutation), useDeleteCampaignStage (mutation), useReorderStages (mutation)

### Components for User Story 1

 - [X] T022 [P] [US1] Create StageCard component in `src/features/campaign-stages/components/stage-config/StageCard.tsx` - display stage info, edit/delete buttons, visual indicators for isInicial/isFinal/cobraCreditos
 - [X] T023 [P] [US1] Create ColorPicker component in `src/features/campaign-stages/components/stage-config/ColorPicker.tsx` - hex color selector with validation, preset colors from DEFAULT_STAGE_COLORS
 - [X] T024 [P] [US1] Create IconPicker component in `src/features/campaign-stages/components/stage-config/IconPicker.tsx` - icon selection from lucide-react, display icon name
 - [X] T025 [P] [US1] Create StageDeleteDialog component in `src/features/campaign-stages/components/stage-config/StageDeleteDialog.tsx` - confirmation dialog with warning about active leads
 - [X] T026 [US1] Create StageFormModal component in `src/features/campaign-stages/components/stage-config/StageFormModal.tsx` (depends on T023, T024) - form with react-hook-form + Zod validation, ColorPicker, IconPicker, charge configuration toggle
 - [X] T027 [US1] Create StageBoard component with drag-and-drop in `src/features/campaign-stages/components/stage-config/StageBoard.tsx` (depends on T022, T026) - @dnd-kit integration, SortableContext, handles drag events, calls reorderStages API
 - [X] T028 [US1] Create StageConfigPage in `src/features/campaign-stages/pages/StageConfigPage.tsx` (depends on T027) - main page with "Create Stage" button, stage list, modal state management

### Component Tests for User Story 1

 - [X] T029 [P] [US1] Component test for StageCard in `tests/features/campaign-stages/component/StageCard.test.tsx` - rendering with different props, button clicks
 - [X] T030 [P] [US1] Component test for StageFormModal in `tests/features/campaign-stages/component/StageFormModal.test.tsx` - form validation, submission, error display
 - [X] T031 [P] [US1] Component test for StageBoard in `tests/features/campaign-stages/component/StageBoard.test.tsx` - drag-and-drop interactions (mocked)

### Routing for User Story 1

 - [X] T032 [US1] Add route `/settings/campaign-stages` to `src/App.tsx` - import StageConfigPage, add route definition

**Checkpoint**: User Story 1 complete - Stages can be created, edited, deleted, and reordered via drag-and-drop. Test independently before proceeding.

---

## Phase 3: User Story 2 - Move Leads Between Stages (Priority: P1) 🎯 MVP

**Goal**: Enable sales reps to move leads between stages via drag-and-drop Kanban board with bulk actions

**Independent Test**: Create campaign with 20 leads, move individual leads between stages, verify transitions and charge warnings

### Tests for User Story 2

- [X] T033 [P] [US2] Unit test for transitionLeadStage in `src/features/campaign-stages/services/stages.test.ts` - test success, charge warning handling
- [X] T034 [P] [US2] Unit test for bulkUpdateLeadStages in `src/features/campaign-stages/services/stages.test.ts` - test success, partial failures (2/50), charge warnings
- [X] T035 [P] [US2] Integration test for lead transition in `tests/features/campaign-stages/integration/lead-transition.test.tsx` - drag lead from "Novo" to "Qualificação", verify history recorded
- [X] T036 [P] [US2] Integration test for bulk update in `tests/features/campaign-stages/integration/bulk-update.test.tsx` - select 10 leads, bulk update to "Perdido", verify success summary

### React Query Hooks for User Story 2

- [X] T037 [US2] Create hooks in `src/features/campaign-stages/hooks/useTransitions.ts` - useTransitionLead (mutation with optimistic updates), useBulkUpdateLeads (mutation)

### Components for User Story 2

- [X] T038 [P] [US2] Create LeadCard component in `src/features/campaign-stages/components/funnel-board/LeadCard.tsx` - draggable card with @dnd-kit, display lead info (nome, empresa, email, score, tags)
- [X] T039 [P] [US2] Create StageColumn component in `src/features/campaign-stages/components/funnel-board/StageColumn.tsx` - droppable column with @dnd-kit, stage header with icon/color, lead count badge, SortableContext for leads
- [X] T040 [P] [US2] Create TransitionReasonModal component in `src/features/campaign-stages/components/funnel-board/TransitionReasonModal.tsx` - modal prompting for motivo (reason) when dragging lead, optional field
- [X] T041 [P] [US2] Create BulkUpdateModal component in `src/features/campaign-stages/components/funnel-board/BulkUpdateModal.tsx` - modal for bulk actions, stage selector, reason input, confirmation
- [X] T042 [US2] Create FunnelBoard component in `src/features/campaign-stages/components/funnel-board/FunnelBoard.tsx` (depends on T038, T039, T040, T041) - DndContext, horizontal scroll of stage columns, drag overlay, handles dragEnd events, calls transition APIs, displays charge warnings via toast
- [X] T043 [US2] Create CampaignFunnelPage in `src/features/campaign-stages/pages/CampaignFunnelPage.tsx` (depends on T042) - page wrapper, loads stages and leads, bulk selection state, integrates FunnelBoard

### Component Tests for User Story 2

 - [X] T044 [P] [US2] Component test for LeadCard in `tests/features/campaign-stages/component/LeadCard.test.tsx` - rendering, drag interactions (mocked)
 - [X] T045 [P] [US2] Component test for StageColumn in `tests/features/campaign-stages/component/StageColumn.test.tsx` - rendering, drop zone behavior
 - [X] T046 [P] [US2] Component test for FunnelBoard in `tests/features/campaign-stages/component/FunnelBoard.test.tsx` - full drag-and-drop flow, reason modal, charge warnings

### Routing for User Story 2

- [X] T047 [US2] Add route `/campaigns/:id/funnel` to `src/App.tsx` - import CampaignFunnelPage, add route with campaignId parameter

**Checkpoint**: User Story 2 complete - Leads can be moved between stages via drag-and-drop, bulk updates work, charge warnings display. Test independently.

---

## Phase 4: User Story 3 - View Lead Stage History (Priority: P1) 🎯 MVP

**Goal**: Display complete audit trail of stage transitions for each lead

**Independent Test**: Move lead through 4-5 stages, view history timeline, verify all transitions with timestamps and durations

### Tests for User Story 3

 - [X] T048 [P] [US3] Unit test for fetchLeadStageHistory in `src/features/campaign-stages/services/stages.test.ts` - test success, empty history, ordering by createdAt DESC
 - [ ] T049 [P] [US3] Integration test for history display in `tests/features/campaign-stages/integration/lead-history.test.tsx` - create transitions, view history, verify all data present

### React Query Hooks for User Story 3

 - [X] T050 [US3] Create hooks in `src/features/campaign-stages/hooks/useStageHistory.ts` - useLeadStageHistory (query)

### Components for User Story 3

 - [X] T051 [P] [US3] Create TimelineMarker component in `src/features/campaign-stages/components/history/TimelineMarker.tsx` - visual marker for timeline (user icon vs robot icon for automatico)
 - [X] T052 [P] [US3] Create TimelineItem component in `src/features/campaign-stages/components/history/TimelineItem.tsx` - display single transition (fromStageName → toStageName, motivo, userName, duracaoHoras, automatico badge)
 - [X] T053 [US3] Create LeadStageHistory component in `src/features/campaign-stages/components/history/LeadStageHistory.tsx` (depends on T051, T052) - vertical timeline container, maps history array to TimelineItems, empty state, loading state

### Component Tests for User Story 3

 - [X] T054 [P] [US3] Component test for TimelineItem in `tests/features/campaign-stages/component/TimelineItem.test.tsx` - rendering with various transition types (manual, automatic, initial)
 - [X] T055 [P] [US3] Component test for LeadStageHistory in `tests/features/campaign-stages/component/LeadStageHistory.test.tsx` - rendering full timeline, empty state, formatted durations

### Integration Points for User Story 3

 - [X] T056 [US3] Integrate LeadStageHistory into campaign contact detail page or modal - import and place component where lead details are displayed

**Checkpoint**: User Story 3 complete - Complete transition history visible with all required information. Test independently.

---

## Phase 5: User Story 4 - View Funnel Metrics Dashboard (Priority: P2)

**Goal**: Visualize funnel metrics with charts showing conversion rates, lead counts, and bottlenecks

**Independent Test**: Create campaign with 100 leads across 6 stages, verify metrics calculations (conversion rates, average durations)

### Tests for User Story 4

 - [X] T057 [P] [US4] Unit test for fetchCampaignFunnelMetrics in `src/features/campaign-stages/services/stages.test.ts` - test success, verify response structure, performance (< 3s for 1000 leads)
 - [X] T058 [P] [US4] Integration test for metrics dashboard in `tests/features/campaign-stages/integration/funnel-metrics.test.tsx` - load metrics, verify calculations, render charts

### React Query Hooks for User Story 4

 - [X] T059 [US4] Create hooks in `src/features/campaign-stages/hooks/useFunnelMetrics.ts` - useCampaignFunnelMetrics (query with 30s staleTime)

### Components for User Story 4

 - [X] T060 [P] [US4] Create StageMetricCard component in `src/features/campaign-stages/components/metrics/StageMetricCard.tsx` - KPI card showing leadCount, percentageOfTotal, conversionFromPrevious, averageDurationHours
 - [X] T061 [P] [US4] Create FunnelChart component in `src/features/campaign-stages/components/metrics/FunnelChart.tsx` - recharts funnel visualization with stage colors, tooltips, conversion rates
 - [X] T062 [P] [US4] Create StageMetricsTable component in `src/features/campaign-stages/components/metrics/StageMetricsTable.tsx` - tabular view of metrics with sorting, filtering
 - [X] T063 [US4] Create CampaignDashboard component in `src/features/campaign-stages/components/metrics/CampaignDashboard.tsx` (depends on T060, T061, T062) - dashboard layout with chart and metric cards, bottleneck highlighting

### Component Tests for User Story 4

 - [X] T064 [P] [US4] Component test for StageMetricCard in `tests/features/campaign-stages/component/StageMetricCard.test.tsx` - rendering with various metric values
 - [X] T065 [P] [US4] Component test for FunnelChart in `tests/features/campaign-stages/component/FunnelChart.test.tsx` - rendering with data, tooltips
 - [X] T066 [P] [US4] Component test for CampaignDashboard in `tests/features/campaign-stages/component/CampaignDashboard.test.tsx` - full dashboard rendering, performance with large datasets

### Routing for User Story 4

 - [X] T067 [US4] Add metrics tab or route `/campaigns/:id/metrics` to campaign detail page - integrate CampaignDashboard component

**Checkpoint**: User Story 4 complete - Funnel metrics visible with charts and KPIs. Performance goals met (< 3s for 1000 leads).

---

## Phase 6: User Story 5 - Configure Stage Charging (Priority: P2)

**Goal**: Configure which stages charge credits and audit all charge transactions

**Independent Test**: Configure stages to charge R$ 5.00, move leads to those stages, verify charges recorded in audit trail

### Tests for User Story 5

 - [X] T068 [P] [US5] Unit test for fetchCampaignCharges in `src/features/campaign-stages/services/stages.test.ts` - test success, filters (startDate, endDate, stageId, foiCobrado)
 - [X] T069 [P] [US5] Unit test for fetchCampaignChargesSummary in `src/features/campaign-stages/services/stages.test.ts` - test success, verify summary structure
 - [X] T070 [P] [US5] Unit test for fetchBillingConfiguration / updateBillingConfiguration in `src/features/campaign-stages/services/stages.test.ts` - test CRUD operations
 - [X] T071 [P] [US5] Integration test for billing configuration in `tests/features/campaign-stages/integration/billing-config.test.tsx` - toggle debitarMudancaEstagio, verify charges occur/don't occur

### React Query Hooks for User Story 5

 - [X] T072 [US5] Create hooks in `src/features/campaign-stages/hooks/useCharges.ts` - useCampaignCharges (query), useCampaignChargesSummary (query), useBillingConfiguration (query), useUpdateBillingConfiguration (mutation)

### Components for User Story 5

 - [X] T073 [P] [US5] Create ChargeConfigForm component in `src/features/campaign-stages/components/billing/ChargeConfigForm.tsx` - form to toggle debitarMudancaEstagio, modeloCobrancaCampanha selector
 - [X] T074 [P] [US5] Create ChargeAuditTable component in `src/features/campaign-stages/components/billing/ChargeAuditTable.tsx` - table of charges with filters (date range, stage, status), columns: leadName, stageName, custocentavos, foiCobrado, erroCobranca, createdAt
 - [X] T075 [P] [US5] Create ChargesSummaryCard component in `src/features/campaign-stages/components/billing/ChargesSummaryCard.tsx` - summary metrics (totalCharges, successfulCharges, failedCharges, totalAmountReais, chargesByStage breakdown)
 - [X] T076 [US5] Create BillingConfigPage in `src/features/campaign-stages/pages/BillingConfigPage.tsx` (depends on T073, T074, T075) - page layout with config form, charge audit table, summary card

### Component Tests for User Story 5

 - [X] T077 [P] [US5] Component test for ChargeConfigForm in `tests/features/campaign-stages/component/ChargeConfigForm.test.tsx` - form submission, toggle behavior
 - [X] T078 [P] [US5] Component test for ChargeAuditTable in `tests/features/campaign-stages/component/ChargeAuditTable.test.tsx` - table rendering, filters, sorting
 - [X] T079 [P] [US5] Component test for ChargesSummaryCard in `tests/features/campaign-stages/component/ChargesSummaryCard.test.tsx` - summary display with various values

### Routing for User Story 5

 - [X] T080 [US5] Add route `/settings/billing` to `src/App.tsx` - import BillingConfigPage, add route definition

**Checkpoint**: User Story 5 complete - Billing configuration works, charge audit trail visible with all required information.

---

## Phase 7: User Story 6 - Manage Stage Lifecycle (Priority: P2)

**Goal**: Edit existing stages, handle validation errors, soft-delete stages

**Independent Test**: Edit stage names/colors, attempt to edit restricted fields (categoria), try to delete stage with active leads

**Note**: Most functionality already implemented in User Story 1 (CRUD operations). This phase focuses on lifecycle edge cases and validation.

### Tests for User Story 6

 - [X] T081 [P] [US6] Add test cases to existing stage tests for lifecycle scenarios - attempt categoria change (should fail 400), delete with active leads (should fail 409), soft delete empty stage (should succeed)

### Components for User Story 6

 - [X] T082 [US6] Enhance StageFormModal component in `src/features/campaign-stages/components/stage-config/StageFormModal.tsx` - add warning messages for restricted field edits, display "This field cannot be changed after creation" for categoria and isInicial in edit mode
 - [X] T083 [US6] Enhance StageDeleteDialog component in `src/features/campaign-stages/components/stage-config/StageDeleteDialog.tsx` - display clear error messages for 409 errors, show number of active leads if deletion fails

### Component Tests for User Story 6

 - [X] T084 [P] [US6] Add test cases to StageFormModal tests for lifecycle validation - test restricted field warnings, error display

**Checkpoint**: User Story 6 complete - Stage lifecycle fully managed with clear validation and error messages.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, final refinements

- [ ] T085 [P] [Polish] Create MSW mock handlers in `src/test/mocks/handlers/stages.ts` - mock all 15+ API endpoints for integration testing
- [ ] T086 [P] [Polish] Add unit tests for utility functions in `tests/features/campaign-stages/unit/utils/type-guards.test.ts` - test isInitialStage, isFinalStage, stageChargesCredits
- [ ] T087 [P] [Polish] Add unit tests for formatters in `tests/features/campaign-stages/unit/utils/formatters.test.ts` - test formatCentavosToReais, formatDurationHours
- [ ] T088 [P] [Polish] Add unit tests for hooks in `tests/features/campaign-stages/unit/hooks/useStages.test.ts` - test query caching, mutation invalidation, optimistic updates
- [ ] T089 [P] [Polish] Performance optimization - implement virtualization for FunnelBoard with @tanstack/react-virtual if >50 leads per column
- [ ] T090 [P] [Polish] Accessibility audit - keyboard navigation, ARIA labels, focus management, color contrast (WCAG AA), screen reader announcements
- [ ] T091 [P] [Polish] Add loading skeletons for all pages - StageConfigPage, CampaignFunnelPage, CampaignDashboard, BillingConfigPage
- [ ] T092 [P] [Polish] Add empty states for all lists - "No stages configured", "No leads in stage", "No history yet", "No charges"
- [ ] T093 [P] [Polish] Add error boundaries for each page component - graceful error handling with user-friendly messages
- [ ] T094 [P] [Polish] Code cleanup and refactoring - extract common patterns, remove console.logs, ensure TypeScript strict mode compliance
- [ ] T095 [P] [Polish] Documentation updates - update README if needed, add JSDoc comments to complex functions
- [ ] T096 [Polish] Run full test suite - ensure >80% coverage for all user stories combined
- [ ] T097 [Polish] Performance benchmark validation - verify all success criteria met (SC-001 through SC-010)
- [ ] T098 [Polish] Quickstart.md validation - follow quickstart guide end-to-end, ensure all steps work

**Checkpoint**: Polish phase complete - Feature is production-ready with high quality, performance, and accessibility.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 2-7)**: All depend on Setup completion (T001-T014)
  - User stories can proceed in parallel after foundation is ready (if team capacity allows)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Setup - No dependencies on other stories
- **US2 (P1)**: Can start after Setup - Independent of US1 (but commonly used together in production)
- **US3 (P1)**: Can start after Setup - Independent of US1/US2 (but displays history created by US2)
- **US4 (P2)**: Can start after Setup - Independent of US1/US2/US3 (but displays metrics from US2 transitions)
- **US5 (P2)**: Can start after Setup - Independent of all other stories (billing configuration)
- **US6 (P2)**: Enhances US1 - Should follow US1 completion

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types & schemas before services
- Services before hooks
- Hooks before components
- Simple components (cards, dialogs) before complex components (boards, pages)
- Components before pages
- Pages before routing
- Story complete before moving to next priority

### Parallel Opportunities

Tasks marked [P] can run in parallel. Examples:

**Phase 1 - All Type Definitions (T003-T007)**:
```bash
# All type files can be created simultaneously
Task: "Create type definitions in src/features/campaign-stages/types/stage.types.ts"
Task: "Create type definitions in src/features/campaign-stages/types/history.types.ts"
Task: "Create type definitions in src/features/campaign-stages/types/charge.types.ts"
Task: "Create type definitions in src/features/campaign-stages/types/metrics.types.ts"
Task: "Create type definitions in src/features/campaign-stages/types/ui.types.ts"
```

**User Story 1 - Tests (T015-T020)**:
```bash
# All unit tests can be written simultaneously
Task: "Unit test for fetchCampaignStages"
Task: "Unit test for createCampaignStage"
Task: "Unit test for updateCampaignStage"
Task: "Unit test for deleteCampaignStage"
Task: "Unit test for reorderCampaignStages"
Task: "Integration test for stage CRUD workflow"
```

**User Story 1 - Simple Components (T022-T025)**:
```bash
# All simple components can be built simultaneously
Task: "Create StageCard component"
Task: "Create ColorPicker component"
Task: "Create IconPicker component"
Task: "Create StageDeleteDialog component"
```

**Multiple User Stories After Foundation**:
```bash
# Once Phase 1 is complete, different team members can work on different stories
Developer A: User Story 1 (Stage Configuration)
Developer B: User Story 2 (Funnel Board)
Developer C: User Story 3 (History Timeline)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup & Foundation (T001-T014)
2. Complete Phase 2: User Story 1 (T015-T032) → Test independently
3. Complete Phase 3: User Story 2 (T033-T047) → Test independently
4. Complete Phase 4: User Story 3 (T048-T056) → Test independently
5. **STOP and VALIDATE**: Test all 3 P1 stories together → Deploy MVP

### Incremental Delivery

1. Foundation (T001-T014) → Ready for any story
2. Add US1 (T015-T032) → Test → Deploy (Stage Config MVP!)
3. Add US2 (T033-T047) → Test → Deploy (Funnel Board added!)
4. Add US3 (T048-T056) → Test → Deploy (History tracking added!)
5. Add US4 (T057-T067) → Test → Deploy (Metrics added!)
6. Add US5 (T068-T080) → Test → Deploy (Billing added!)
7. Add US6 (T081-T084) → Test → Deploy (Lifecycle complete!)
8. Polish (T085-T098) → Final refinements → Production release

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 together (T001-T014)
2. Once foundation is done, split work:
   - **Developer A**: US1 Stage Configuration (T015-T032)
   - **Developer B**: US2 Funnel Board (T033-T047)
   - **Developer C**: US3 History Timeline (T048-T056)
3. Stories integrate seamlessly when complete
4. Continue with P2 stories (US4, US5, US6) in parallel or sequentially
5. Final polish phase together (T085-T098)

---

## Testing Strategy Summary

### Test Distribution

- **Unit Tests**: ~40 tests
  - Service functions: 15 tests (T015-T019, T033-T034, T048, T057, T068-T070)
  - Hooks: 5 tests (T088)
  - Utils: 5 tests (T086-T087)

- **Component Tests**: ~25 tests
  - Stage Config: 3 tests (T029-T031)
  - Funnel Board: 3 tests (T044-T046)
  - History: 2 tests (T054-T055)
  - Metrics: 3 tests (T064-T066)
  - Billing: 3 tests (T077-T079)

- **Integration Tests**: ~10 tests
  - Stage CRUD: 1 test (T020)
  - Lead transitions: 2 tests (T035-T036)
  - History display: 1 test (T049)
  - Metrics dashboard: 1 test (T058)
  - Billing config: 1 test (T071)

### Test Coverage Goal

- Overall coverage: > 80%
- Critical paths (stage transitions, billing): > 90%
- UI components: > 75%

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each logical task or small group of related tasks
- Stop at any checkpoint to validate story independently
- All paths are relative to repository root
- Portuguese (pt-BR) strings throughout UI
- Performance goals: < 500ms UI updates, < 3s metrics load
- Accessibility is a requirement, not optional
- Multi-tenancy isolation via backend RLS (empresaId)

---

## Task Count Summary

- **Phase 1 (Setup)**: 14 tasks (T001-T014)
- **Phase 2 (US1)**: 18 tasks (T015-T032)
- **Phase 3 (US2)**: 15 tasks (T033-T047)
- **Phase 4 (US3)**: 9 tasks (T048-T056)
- **Phase 5 (US4)**: 11 tasks (T057-T067)
- **Phase 6 (US5)**: 13 tasks (T068-T080)
- **Phase 7 (US6)**: 4 tasks (T081-T084)
- **Phase 8 (Polish)**: 14 tasks (T085-T098)

**Total**: 98 tasks

**Estimated Effort**: 6-8 weeks (3-4 sprints) for all user stories + polish

---

**Tasks Version**: 1.0
**Generated**: 2025-10-09
**Status**: Ready for implementation
**Next Step**: Start with Phase 1 (Setup & Foundation) tasks T001-T014
