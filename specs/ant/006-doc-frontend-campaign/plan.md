# Implementation Plan: Campaign Lead Stages Management Frontend

**Branch**: `006-doc-frontend-campaign` | **Date**: 2025-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-doc-frontend-campaign/spec.md`

## Summary

This feature implements a comprehensive CRM-style pipeline system for managing campaign leads through customizable stages, similar to Pipedrive or HubSpot. The backend API is 100% complete with full CRUD operations for stages, lead transitions (individual and bulk), stage history tracking, funnel metrics, and credit charging. The frontend implementation will provide:

1. **Stage Configuration UI (P1)** - CRUD operations for stages with drag-and-drop reordering, color/icon customization, and charge configuration
2. **Kanban Funnel Board (P1)** - Visual pipeline with drag-and-drop lead movement between stages, bulk actions, and charge warnings
3. **Timeline History View (P1)** - Complete audit trail of lead transitions with timestamps, durations, reasons, and user attribution
4. **Metrics Dashboard (P2)** - Funnel visualization with conversion rates, lead counts, and bottleneck identification
5. **Billing Management (P2)** - Configuration of charge models and audit trail of all charges

**Technical Approach**: Leverage existing patterns from `src/features/campaigns`, use React Query for state management, @dnd-kit for drag-and-drop, Radix UI components for interface, and recharts for visualizations. All UI components follow established design system.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 18.3.1, Vite 5.4.19

**Primary Dependencies**:
- State Management: @tanstack/react-query 5.89
- Drag & Drop: @dnd-kit/* (core 6.3.1, sortable 10.0.0, utilities 3.2.2)
- UI Components: Radix UI primitives (various v1.x)
- Forms: react-hook-form 7.62 + zod 3.25 validation
- Charts: recharts 2.15.4
- HTTP Client: Custom ApiClient (src/shared/services/client.ts) with Axios 1.11
- Icons: lucide-react 0.462.0
- Notifications: react-hot-toast 2.6 + sonner 1.7.4

**Storage**: Backend PostgreSQL (via API), Frontend React Query cache

**Testing**: Vitest 3.2.4, @testing-library/react 16.3.0, MSW 2.11.3 for mocking

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), Desktop and Mobile responsive

**Project Type**: Web frontend (React SPA)

**Performance Goals**:
- Funnel metrics load: < 3 seconds for 1000 leads
- Stage transition UI update: < 500ms after API response
- Bulk update of 50 leads: < 5 seconds
- Drag-and-drop operations: 60 FPS smooth animations

**Constraints**:
- Backend API is read-only (no modifications allowed)
- Multi-tenancy: All data scoped by empresaId (JWT)
- Must support negative credit balances (non-blocking transitions)
- Maximum 20 stages per company
- Portuguese (pt-BR) language for all UI strings

**Scale/Scope**:
- 6 user stories (3 P1, 3 P2)
- 25 functional requirements
- ~15 components, ~10 hooks, ~15 service functions
- Estimated 3-4 sprints (6-8 weeks) for complete implementation

## Constitution Check

*Constitution file is a template placeholder - no specific rules defined yet.*

**Status**: ✅ No violations

**Analysis**:
- Feature follows existing codebase patterns (feature-based organization)
- Uses established libraries already in package.json
- No new architectural patterns introduced
- Adheres to React best practices
- TypeScript strict mode compatible

**Gate Check**: ✅ **PASSED** - Proceed with implementation

## Project Structure

### Documentation (this feature)

```
specs/006-doc-frontend-campaign/
├── plan.md                   # ✅ This file (implementation plan)
├── spec.md                   # ✅ Feature specification
├── research.md               # ✅ Phase 0 output (codebase analysis)
├── data-model.md             # ✅ Phase 1 output (TypeScript types)
├── quickstart.md             # ✅ Phase 1 output (developer guide)
├── contracts/                # ✅ Phase 1 output (API contracts)
│   └── api-services.md       # Service layer function signatures
└── tasks.md                  # ⏳ Phase 2 output (created by /tasks command)
```

### Source Code (repository root)

```
src/features/campaign-stages/     # NEW: Campaign stages feature module
├── components/                    # React components
│   ├── stage-config/              # Stage configuration UI (US1)
│   │   ├── StageCard.tsx
│   │   ├── StageBoard.tsx         # Drag-and-drop stage list
│   │   ├── StageFormModal.tsx     # Create/edit form
│   │   ├── StageDeleteDialog.tsx
│   │   ├── ColorPicker.tsx
│   │   └── IconPicker.tsx
│   ├── funnel-board/              # Kanban funnel board (US2)
│   │   ├── FunnelBoard.tsx        # Main container
│   │   ├── StageColumn.tsx
│   │   ├── LeadCard.tsx           # Draggable lead card
│   │   ├── BulkUpdateModal.tsx
│   │   └── TransitionReasonModal.tsx
│   ├── history/                   # Stage history timeline (US3)
│   │   ├── LeadStageHistory.tsx
│   │   ├── TimelineItem.tsx
│   │   └── TimelineMarker.tsx
│   ├── metrics/                   # Funnel metrics dashboard (US4)
│   │   ├── CampaignDashboard.tsx
│   │   ├── FunnelChart.tsx
│   │   ├── StageMetricCard.tsx
│   │   └── StageMetricsTable.tsx
│   └── billing/                   # Billing configuration (US5, US6)
│       ├── BillingConfigPage.tsx
│       ├── ChargeConfigForm.tsx
│       ├── ChargeAuditTable.tsx
│       └── ChargesSummaryCard.tsx
├── hooks/                         # Custom React hooks
│   ├── useStages.ts               # Stage CRUD operations
│   ├── useTransitions.ts          # Lead transition mutations
│   ├── useStageHistory.ts         # History queries
│   ├── useFunnelMetrics.ts        # Metrics queries
│   └── useCharges.ts              # Charge queries
├── services/                      # API service layer
│   └── stages.ts                  # All API functions (15+ functions)
├── types/                         # TypeScript definitions
│   ├── index.ts                   # Re-exports
│   ├── stage.types.ts
│   ├── history.types.ts
│   ├── charge.types.ts
│   ├── metrics.types.ts
│   ├── ui.types.ts
│   └── constants.ts
├── schemas/                       # Zod validation schemas
│   ├── index.ts
│   ├── stage.schemas.ts
│   ├── transition.schemas.ts
│   └── charge.schemas.ts
├── utils/                         # Utility functions
│   ├── type-guards.ts
│   ├── validators.ts
│   └── formatters.ts              # e.g., centavos to reais
├── pages/                         # Page components
│   ├── StageConfigPage.tsx
│   ├── CampaignFunnelPage.tsx
│   └── BillingConfigPage.tsx
└── index.ts                       # Public exports

tests/features/campaign-stages/    # Tests
├── unit/
│   ├── services/                  # Service function tests
│   ├── hooks/                     # Custom hook tests
│   └── utils/                     # Utility function tests
├── component/                     # Component tests
│   ├── StageCard.test.tsx
│   ├── FunnelBoard.test.tsx
│   └── LeadStageHistory.test.tsx
└── integration/                   # Full workflow tests
    ├── stage-crud.test.tsx
    ├── lead-transition.test.tsx
    └── bulk-update.test.tsx
```

### Routing Updates

```typescript
// src/App.tsx - Add new routes

import { StageConfigPage } from '@/features/campaign-stages/pages/StageConfigPage'
import { CampaignFunnelPage } from '@/features/campaign-stages/pages/CampaignFunnelPage'
import { BillingConfigPage } from '@/features/campaign-stages/pages/BillingConfigPage'

// New routes:
{
  path: '/settings/campaign-stages',
  element: <StageConfigPage />
},
{
  path: '/campaigns/:id/funnel',
  element: <CampaignFunnelPage />
},
{
  path: '/settings/billing',
  element: <BillingConfigPage />
}
```

**Structure Decision**: This feature follows the established pattern from `src/features/campaigns` and other feature modules. Feature-based organization groups all related files (components, hooks, services, types) under a single directory, making the codebase easier to navigate and maintain. No changes to existing features are required except for optional integration with the pipeline feature (to be determined based on usage analysis).

## Integration Points

### 1. Existing Campaign Types Extension

The existing `Campaign` and `CampaignContact` interfaces in `src/features/campaigns/types/campaigns.ts` will be extended (non-breaking):

```typescript
// src/features/campaigns/types/campaigns.ts - ADD these fields

export interface Campaign {
  // ... existing fields ...

  // NEW: Stage-related fields
  currentStages?: CampaignLeadStage[]  // Cache of active stages
  defaultStageId?: string               // Initial stage for new leads
}

export interface CampaignContact {
  // ... existing fields ...

  // NEW: Stage tracking fields
  currentStageId?: string               // Current stage UUID
  stageChangedAt?: string               // ISO 8601 timestamp
  stageChangedBy?: string               // User UUID
}
```

These additions are **backward compatible** - existing code will continue to work.

### 2. Navigation Menu Updates

Add links to new pages in the main navigation:

```typescript
// src/shared/components/Navigation.tsx or equivalent

<NavItem to="/settings/campaign-stages" icon="layers">
  Estágios de Campanha
</NavItem>

// In campaign detail page
<TabsItem value="funnel">
  Funil de Vendas
</TabsItem>
```

### 3. Pipeline Feature Analysis

**Current State**: There is an existing pipeline feature in `src/features/pipeline/`

**Decision Required**: Investigate if the old pipeline is actively used:
- **Option A**: If actively used, keep both systems (pipeline for deals, stages for campaign leads)
- **Option B**: If not used, deprecate pipeline and migrate to new stage system
- **Option C**: Refactor pipeline to use campaign stages underneath

**Recommendation**: Defer decision until after researching usage patterns. Implementation can proceed independently.

## Complexity Tracking

*No constitutional violations detected. This section intentionally left empty.*

## Implementation Phases

### ✅ Phase 0: Research (COMPLETED)

**Output**: `research.md`

**Key Findings**:
- Backend 100% complete with all APIs available
- Existing codebase patterns well-established and documented
- All required npm packages already installed
- No technical blockers identified
- Performance requirements are achievable

### ✅ Phase 1: Design (COMPLETED)

**Outputs**:
- `data-model.md` - Complete TypeScript type definitions
- `contracts/api-services.md` - Service layer contracts
- `quickstart.md` - Developer onboarding guide

**Artifacts Created**:
- 50+ TypeScript interfaces and types
- 15+ service function signatures
- 10+ Zod validation schemas
- Constants and utility type guards
- React Query cache configuration

### ⏳ Phase 2: Task Breakdown (DEFERRED)

**Note**: This phase is executed by the `/tasks` command, not `/plan`.

**Output**: `tasks.md`

**Expected Content**:
- Ordered list of implementation tasks
- Task dependencies
- Estimated effort per task
- Acceptance criteria per task

**When to Run**: After plan approval, before starting development.

## Development Strategy

### Sprint 1-2: Stage Configuration (Priority P1) - Weeks 1-2

**User Story 1**: Configure Custom Lead Stages

**Deliverables**:
- Stage CRUD operations (create, read, update, delete)
- Drag-and-drop reordering
- Form validation (Zod schemas)
- Color and icon pickers
- Charge configuration UI
- Error handling for business rules (max 20 stages, unique names, etc.)

**Testing**:
- Unit tests for service functions
- Component tests for StageCard, StageFormModal
- Integration test for full CRUD workflow

### Sprint 3-4: Funnel Board (Priority P1) - Weeks 3-4

**User Story 2**: Move Leads Between Stages

**Deliverables**:
- Kanban-style board with columns per stage
- Drag-and-drop leads between stages
- Reason prompt on transition
- Bulk selection and update
- Charge warning toasts
- Optimistic UI updates

**Testing**:
- Unit tests for transition mutations
- Component tests for LeadCard, StageColumn
- Integration test for drag-and-drop workflow
- Mock @dnd-kit interactions

### Sprint 5: History Timeline (Priority P1) - Week 5

**User Story 3**: View Lead Stage History

**Deliverables**:
- Timeline component with vertical layout
- Display all transition details (from/to, motivo, duration, user)
- Automatic vs manual badges
- Formatted duration display
- Empty state handling

**Testing**:
- Component tests for timeline rendering
- Integration test for history display

### Sprint 6: Funnel Metrics (Priority P2) - Week 6

**User Story 4**: View Funnel Metrics Dashboard

**Deliverables**:
- Funnel chart visualization (recharts)
- Stage metric cards (lead count, conversion rate)
- Average duration display
- Bottleneck highlighting
- Performance optimization for 1000+ leads

**Testing**:
- Component tests for charts and cards
- Performance tests with large datasets

### Sprint 7-8: Billing & Charges (Priority P2) - Weeks 7-8

**User Stories 5 & 6**: Configure Stage Charging, Manage Stage Lifecycle

**Deliverables**:
- Billing configuration page
- Charge toggle per stage
- Charge history table with filters
- Charges summary cards
- Stage edit/delete with lifecycle management

**Testing**:
- Integration tests for billing workflows
- Component tests for charge displays

## Risk Management

### Risk 1: Drag-and-Drop Performance

**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Use @dnd-kit (already proven in production)
- Implement virtualization if >50 leads per column
- Profile with React DevTools
- Use `requestAnimationFrame` for smooth animations

### Risk 2: React Query Cache Invalidation

**Impact**: Medium
**Probability**: Medium
**Mitigation**:
- Follow established query key patterns
- Document cache invalidation rules
- Use optimistic updates for perceived performance
- Test cache behavior in integration tests

### Risk 3: Credit Charge Warning Visibility

**Impact**: High (user confusion if missed)
**Probability**: Low
**Mitigation**:
- Use prominent toast notifications (sonner)
- Add persistent banner if charge fails
- Include warning icon on affected leads
- Log charge failures for support team

### Risk 4: Multi-tenancy Data Leaks

**Impact**: Critical
**Probability**: Very Low (backend RLS prevents this)
**Mitigation**:
- Backend RLS already enforces isolation
- Frontend validates empresaId in responses
- Never cache data across different empresaId contexts
- Add defensive checks in service layer

### Risk 5: Pipeline Feature Conflicts

**Impact**: Medium
**Probability**: TBD (requires usage analysis)
**Mitigation**:
- Research current pipeline usage before making decisions
- Maintain clear separation of concerns
- Document migration path if needed
- Communicate changes to stakeholders

## Testing Strategy

### Unit Tests (~40 tests)

**Service Layer** (src/features/campaign-stages/services/\*.test.ts):
- fetchCampaignStages with various filters
- createCampaignStage success and error cases
- updateCampaignStage validation
- deleteCampaignStage with active leads (error)
- reorderCampaignStages
- transitionLeadStage with charge warnings
- bulkUpdateLeadStages partial failures
- fetchLeadStageHistory
- fetchCampaignFunnelMetrics
- fetchCampaignCharges with filters

**Hooks** (src/features/campaign-stages/hooks/\*.test.ts):
- useCampaignStages query behavior
- useCreateCampaignStage mutation + cache invalidation
- useTransitionLead optimistic updates
- useBulkUpdateLeads error handling

**Utils** (src/features/campaign-stages/utils/\*.test.ts):
- Type guards (isInitialStage, isFinalStage, etc.)
- Formatters (centavos to reais, duration formatting)
- Validators (hex color, stage name uniqueness)

### Component Tests (~25 tests)

**Stage Config Components**:
- StageCard rendering with different props
- StageFormModal form validation
- ColorPicker color selection
- IconPicker icon selection

**Funnel Board Components**:
- LeadCard drag interactions (mocked)
- StageColumn drop zones
- FunnelBoard full drag-and-drop flow
- TransitionReasonModal prompt

**History Components**:
- LeadStageHistory timeline rendering
- TimelineItem with various transition types
- Empty state display

**Metrics Components**:
- FunnelChart rendering with data
- StageMetricCard KPI display
- StageMetricsTable sorting/filtering

### Integration Tests (~10 tests)

**End-to-End Workflows**:
- Full stage CRUD lifecycle
- Drag lead from "Novo" to "Qualificação" with reason
- Bulk update 10 leads to "Perdido"
- View history after multiple transitions
- Configure stage charging and verify warnings
- Delete stage attempt with active leads (should fail)

### Contract Tests

**MSW Mock Handlers** (src/test/mocks/handlers/stages.ts):
- Mock all 15+ API endpoints
- Validate request/response shapes
- Test error responses (400, 409, 404)

## Performance Benchmarks

### Target Metrics

| Operation | Target | Current | Status |
|-----------|--------|---------|--------|
| Funnel metrics load (1000 leads) | < 3s | TBD | ⏳ To measure |
| Stage transition UI update | < 500ms | TBD | ⏳ To measure |
| Bulk update 50 leads | < 5s | TBD | ⏳ To measure |
| Drag-and-drop FPS | 60 FPS | TBD | ⏳ To measure |
| Stage list initial load | < 1s | TBD | ⏳ To measure |

**Measurement Tools**:
- React DevTools Profiler
- Chrome Lighthouse
- Network tab for API call timing
- Custom performance markers

**Optimization Strategies**:
- React Query aggressive caching
- Debounced search inputs
- Virtualization for long lists (@tanstack/react-virtual)
- Memoization of expensive calculations (useMemo, useCallback)
- Code splitting for non-critical features

## Accessibility Checklist

- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels on buttons, inputs, modals
- [ ] Focus management (trap in modals, return after close)
- [ ] Screen reader announcements for stage transitions (live regions)
- [ ] Color contrast WCAG AA (4.5:1) for all stage colors
- [ ] Alt text for icons (via aria-label)
- [ ] Skip links for keyboard users
- [ ] Semantic HTML (header, main, section, article)
- [ ] Form labels properly associated
- [ ] Error messages announced to screen readers

## Security Considerations

- ✅ Authentication: Bearer JWT tokens (handled by ApiClient)
- ✅ Authorization: Backend RLS by empresaId (cannot be bypassed)
- ✅ Input Validation: Zod schemas on frontend, backend also validates
- ✅ XSS Prevention: React escapes by default, avoid dangerouslySetInnerHTML
- ✅ CSRF: Not applicable (JWT-based API, no cookies)
- ✅ Sensitive Data: No passwords or secrets in frontend
- ✅ API Key Exposure: Environment variables, not committed to repo

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All P1 user stories completed and tested
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Code review approved
- [ ] QA testing completed
- [ ] Documentation updated

### Deployment Steps

1. **Merge to main branch**
   - PR review by 2+ developers
   - CI/CD pipeline runs all tests
   - Build succeeds without warnings

2. **Deploy to staging environment**
   - Smoke test critical paths
   - Load test with realistic data
   - Verify API integration

3. **Deploy to production**
   - Feature flag: OFF initially
   - Gradual rollout: 10% → 50% → 100%
   - Monitor error rates and performance

4. **Post-Deployment**
   - Monitor user feedback
   - Track adoption metrics
   - Address bugs within 24-48 hours

### Rollback Plan

If critical issues are detected:
1. Disable feature flag immediately
2. Revert frontend deployment if needed
3. Backend remains unchanged (backward compatible)
4. Investigate root cause
5. Fix and redeploy

## Success Criteria

### Measurable Outcomes (from spec.md)

- **SC-001**: ✅ Users create 5 stages in < 3 minutes
- **SC-002**: ✅ Lead transitions update UI in < 500ms
- **SC-003**: ✅ Bulk update 50 leads in < 5 seconds
- **SC-004**: ✅ Funnel metrics load in < 3 seconds (1000 leads)
- **SC-005**: ✅ History displays 100% of transitions correctly
- **SC-006**: ✅ Charges recorded with 100% accuracy
- **SC-007**: ✅ Invalid operations prevented with clear errors
- **SC-008**: ✅ Drag-and-drop works smoothly in 100% of attempts
- **SC-009**: ✅ Charge warnings displayed prominently
- **SC-010**: ✅ 0 cross-company data leaks

### Definition of Done

A task is considered "done" when:
- [ ] Code is written and follows style guide
- [ ] Unit tests written and passing (> 80% coverage)
- [ ] Component tests written and passing
- [ ] Integration test covers the workflow
- [ ] Code reviewed and approved
- [ ] Documentation updated (if applicable)
- [ ] Accessibility requirements met
- [ ] Performance benchmarks met
- [ ] No console errors or warnings
- [ ] Deployed to staging and tested

## Next Steps

1. ✅ **Complete Phase 0**: Research (DONE)
2. ✅ **Complete Phase 1**: Design (DONE)
3. ⏳ **Run `/tasks` command**: Generate tasks.md with ordered task list
4. 🔜 **Start Sprint 1**: Implement Stage Configuration (US1)
5. 🔜 **Continue Sprints 2-8**: Follow development strategy

## Open Questions for Product Team

1. **Pipeline Coexistence**: Should we keep the old pipeline feature or deprecate it in favor of campaign stages?
2. **Default Stages**: Should we auto-create default stages (Novo, Qualificação, Ganho, Perdido) for new companies?
3. **Stage Limit Warning**: At what threshold should we warn users approaching the 20-stage limit? (15? 18?)
4. **Bulk Update Max**: Is there a maximum number of leads that can be updated in bulk? (Backend might have limits)
5. **Charge Display**: Should charges be visible on lead cards, stage headers, or only in dedicated billing page?
6. **Negative Balance Alert**: Should we show a persistent banner when credit balance is negative?

---

## Appendix

### References

- **Feature Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-services.md](./contracts/api-services.md)
- **Quickstart Guide**: [quickstart.md](./quickstart.md)
- **Backend Spec**: `/doc/FRONTEND_CAMPAIGN_STAGES_SPEC.md` (repository root)

### External Documentation

- [React Query Docs](https://tanstack.com/query/latest)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Recharts Documentation](https://recharts.org/)
- [Vitest Documentation](https://vitest.dev/)

---

**Plan Version**: 1.0
**Last Updated**: 2025-10-09
**Status**: ✅ Complete - Ready for `/tasks` command
**Confidence Level**: High (backend complete, patterns established, no blockers)
