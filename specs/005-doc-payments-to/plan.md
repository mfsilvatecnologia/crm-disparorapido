# Implementation Plan: Payments, Subscriptions and Credits Management

**Branch**: `005-doc-payments-to` | **Date**: 2025-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-doc-payments-to/spec.md`

**Note**: This plan was generated using the `/plan` workflow based on clarified requirements.

## Summary

Implement a comprehensive financial management interface for the LeadsRapido CRM frontend that allows company administrators to:

- View and filter payment history with pagination (10 items/page)
- Monitor credit transactions and balance
- View financial summaries across different time periods
- Initiate trial subscriptions with card validation
- Manage subscription lifecycle and status
- Perform actions on payments (cancel/refund)

The implementation will integrate with existing backend APIs for payments, credits, and subscriptions, following the established React + TypeScript + TanStack Query architecture pattern already present in the codebase.

**Planning Artifacts Generated**:

- ✅ `plan.md` - This implementation plan
- ✅ `research.md` - Technical decisions, architectural patterns, API contracts assumptions
- ✅ `data-model.md` - TypeScript interfaces, Zod schemas, type guards, query keys
- ✅ `contracts/` - API contract documentation (payments, credits, financial)
  - `payments-api.md` - Payment list, details, cancel, refund endpoints
  - `credits-api.md` - Credit balance, transaction list endpoints
  - `financial-api.md` - Financial summary endpoint
- ✅ `quickstart.md` - Developer onboarding guide with code examples

## Technical Context

**Language/Version**: TypeScript 5.x + React 18.x
**Primary Dependencies**: 
- React 18.3.1 (UI framework)
- TanStack Query v5 (server state management)
- React Router v6 (routing)
- Tailwind CSS + shadcn/ui (styling + components)
- Zod (validation)
- React Hot Toast (notifications)
- Vite (build tool)

**Storage**: Backend API (REST) - no direct frontend storage
**Testing**: Vitest + React Testing Library (unit, integration, contract tests)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - modern versions)
**Project Type**: Web application (frontend only - SPA)
**Performance Goals**: 
- Initial page load < 3s
- API response handling < 500ms
- Pagination should handle 10k+ records efficiently
- Smooth UI interactions (60fps)

**Constraints**: 
- Must use existing API client pattern (@/lib/api-client)
- Follow established feature-sliced architecture (src/features/)
- All monetary values formatted as Brazilian Real (R$)
- Pagination fixed at 10 items per page
- No offline mode required

**Scale/Scope**: 
- 5-7 new pages/components
- ~15-20 API integrations
- Support for companies with unlimited payment history
- Handle concurrent user actions gracefully

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (No constitution file found - proceeding with standard best practices)

The project follows established patterns:
- Feature-sliced architecture (existing pattern in src/features/)
- API client abstraction (existing @/lib/api-client)
- Type safety with TypeScript and Zod validation
- Testing strategy with Vitest (unit + integration + contract)
- Component-based UI with React and shadcn/ui

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── features/
│   └── sales/              # Existing feature - will be extended
│       ├── api/
│       │   ├── paymentsApi.ts        # NEW: Payment history API
│       │   ├── creditsApi.ts         # EXISTS: Credit operations (to be enhanced)
│       │   ├── subscriptionsApi.ts   # EXISTS: Subscription operations (enhanced)
│       │   └── productsApi.ts        # EXISTS: Product/plan listing
│       ├── hooks/
│       │   ├── payments/
│       │   │   ├── usePayments.ts           # NEW: Payment list with filters
│       │   │   ├── usePaymentDetails.ts     # NEW: Single payment details
│       │   │   ├── useCancelPayment.ts      # NEW: Cancel payment mutation
│       │   │   └── useRefundPayment.ts      # NEW: Refund payment mutation
│       │   ├── credits/
│       │   │   ├── useCreditTransactions.ts # NEW: Credit transaction list
│       │   │   └── useCreditBalance.ts      # EXISTS: Current balance
│       │   ├── subscriptions/
│       │   │   ├── useSubscription.ts       # EXISTS: Current subscription
│       │   │   ├── useTrialActivation.ts    # EXISTS: Trial activation
│       │   │   └── useProduct.ts            # EXISTS: Product details
│       │   └── financial/
│       │       └── useFinancialSummary.ts   # NEW: Aggregated metrics
│       ├── types/
│       │   ├── payment.types.ts      # NEW: Payment interfaces
│       │   ├── credit.types.ts       # EXISTS: Credit interfaces
│       │   ├── subscription.types.ts # EXISTS: Subscription interfaces
│       │   └── product.types.ts      # EXISTS: Product interfaces
│       ├── schemas/
│       │   ├── payment.schema.ts     # NEW: Zod validation
│       │   ├── credit.schema.ts      # EXISTS: Credit validation
│       │   └── subscription.schema.ts # EXISTS: Subscription validation
│       ├── components/
│       │   ├── payments/
│       │   │   ├── PaymentList.tsx            # NEW: Paginated list
│       │   │   ├── PaymentFilters.tsx         # NEW: Status/date filters
│       │   │   ├── PaymentCard.tsx            # NEW: Payment item display
│       │   │   ├── PaymentDetails.tsx         # NEW: Detailed view
│       │   │   ├── PaymentActions.tsx         # NEW: Cancel/refund buttons
│       │   │   └── PaymentStatusBadge.tsx     # NEW: Status indicator
│       │   ├── credits/
│       │   │   ├── CreditTransactionList.tsx  # NEW: Transaction history
│       │   │   ├── CreditBalanceCard.tsx      # EXISTS: Balance display
│       │   │   └── TransactionTypeFilter.tsx  # NEW: Type filter
│       │   ├── subscriptions/
│       │   │   ├── CheckoutFlow/              # EXISTS: Trial flow components
│       │   │   ├── SubscriptionDashboard/     # EXISTS: Status display
│       │   │   └── TrialBanner.tsx            # EXISTS: Trial info
│       │   └── financial/
│       │       ├── FinancialSummaryCard.tsx   # NEW: Metrics display
│       │       └── PeriodSelector.tsx         # NEW: Time period picker
│       ├── pages/
│       │   ├── PaymentHistoryPage.tsx         # NEW: Main payments page
│       │   ├── PaymentDetailsPage.tsx         # NEW: Single payment view
│       │   ├── CreditTransactionsPage.tsx     # NEW: Credits page
│       │   ├── FinancialDashboardPage.tsx     # NEW: Summary dashboard
│       │   ├── CheckoutPage.tsx               # EXISTS: Trial activation
│       │   ├── PricingPage.tsx                # EXISTS: Plan selection
│       │   └── SubscriptionManagementPage.tsx # EXISTS: Subscription status
│       ├── services/
│       │   ├── paymentService.ts     # NEW: Payment utilities
│       │   ├── creditService.ts      # EXISTS: Credit utilities
│       │   └── subscriptionService.ts # EXISTS: Subscription utilities
│       └── utils/
│           └── formatters.ts         # EXISTS: Currency/date formatters
├── lib/
│   └── api-client.ts                 # EXISTS: HTTP client with auth
└── shared/
    ├── components/
    │   ├── Pagination.tsx            # EXISTS: Reusable pagination
    │   └── DataTable.tsx             # EXISTS: Reusable table
    └── contexts/
        └── AuthContext.tsx           # EXISTS: Authentication state

tests/
├── contract/
│   └── sales/
│       ├── payments.contract.test.ts     # NEW: Payment API contracts
│       ├── credits.contract.test.ts      # NEW: Credit API contracts
│       └── subscriptions.contract.test.ts # EXISTS: Subscription contracts
├── integration/
│   └── sales/
│       ├── payment-flow.test.tsx         # NEW: Payment viewing/actions
│       ├── credit-flow.test.tsx          # NEW: Credit transaction viewing
│       ├── trial-flow.test.tsx           # EXISTS: Trial activation flow
│       └── financial-summary.test.tsx    # NEW: Dashboard metrics
└── unit/
    └── sales/
        ├── components/                    # NEW: Component unit tests
        ├── hooks/                         # NEW: Hook unit tests
        └── services/                      # NEW: Service unit tests
```

**Structure Decision**: Web application (frontend-only SPA) using existing feature-sliced architecture. The `sales` feature will be significantly extended with new payment, credit transaction, and financial summary capabilities while maintaining compatibility with existing subscription/trial functionality.

## Complexity Tracking

**Overall Estimate**: `MEDIUM`

**Reasoning**:

- **Spec Length**: Comprehensive spec with 19 acceptance scenarios and 43 functional requirements
- **Infrastructure Changes**: None - Uses existing API client, auth, and database
- **External Integrations**: None - All data comes from existing backend APIs
- **Cross-team Dependencies**: Minimal - Assumes backend APIs already exist (`/api/payments`, `/api/credits/transactions`, `/api/subscriptions`)
- **Anticipated Unknowns**:
  - Backend API contracts may require minor adjustments for filtering/pagination
  - Payment action endpoints (cancel/refund) need to be confirmed with backend team
  - Real-time updates for payment status changes not specified (using polling vs WebSockets)
- **Extension of Existing Feature**: Building on top of established `sales` feature with consistent patterns
- **Reusable Components**: Leveraging existing pagination, table components, and API client infrastructure
- **Testing Overhead**: Moderate - Requires contract, integration, and unit tests for new functionality

**Complexity Drivers**:

- **Moderate**: Payment list with multiple filters (status, date range, pagination)
- **Low**: Credit transaction viewing (similar pattern to payment list)
- **Low**: Financial summary dashboard (aggregation of existing data)
- **Moderate**: Payment actions (cancel/refund with authorization checks and error handling)
- **Low**: UI components (consistent with existing design system)

`[ ]` **Potentially large** — revisit with PM or flag for spike

---

## Constitution Justification

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
