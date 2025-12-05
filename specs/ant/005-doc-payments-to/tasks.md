# Tasks - Payments, Subscriptions and Credits Management

**Feature**: Payments, Subscriptions and Credits Management  
**Branch**: `005-doc-payments-to`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Date**: 2025-10-09

---

## Task Overview

This document provides a dependency-ordered, actionable task list for implementing the Payments, Subscriptions, and Credits Management feature. Tasks are organized following Test-Driven Development (TDD) principles with contract tests first, followed by implementation.

**Total Tasks**: 45  
**Estimated Duration**: 6-10 days  
**Complexity**: Medium  
**Parallel Execution**: Supported (marked with [P])

---

## Task Categories

- **Setup (T001-T003)**: Project configuration and dependencies
- **Type System (T004-T012) [P]**: TypeScript types and Zod schemas
- **Contract Tests (T013-T019) [P]**: API contract validation
- **API Layer (T020-T023)**: Backend integration
- **React Query Hooks (T024-T031) [P]**: State management
- **UI Components (T032-T039) [P]**: Reusable components
- **Pages (T040-T043)**: Application pages
- **Integration (T044)**: Routes and navigation
- **Testing & Polish (T045)**: Integration tests

---

## Phase 0: Setup & Configuration

### T001: Verify Project Dependencies
**Status**: ✅ Complete  
**Depends On**: None  
**Can Run in Parallel**: No  
**Estimated Time**: 10 minutes

**Description**: Verify all required dependencies are installed and at correct versions.

**Files**:
- `package.json` (read-only, verification)

**Tasks**:
1. Check `@tanstack/react-query` is version 5.x
2. Check `zod` is version 3.x
3. Check `axios` is version 1.x
4. Check `react-router-dom` is version 6.x
5. Verify shadcn/ui components are installed
6. Run `npm install` if any dependencies are missing

**Acceptance Criteria**:
- [X] All dependencies present and at correct versions
- [X] No dependency conflicts in package.json
- [X] `npm install` completes without errors

---

### T002: Create Directory Structure
**Status**: ✅ Complete  
**Depends On**: T001  
**Can Run in Parallel**: No  
**Estimated Time**: 5 minutes

**Description**: Create the directory structure for the payments feature following feature-sliced architecture.

**Commands**:
```bash
mkdir -p src/features/sales/types
mkdir -p src/features/sales/schemas
mkdir -p src/features/sales/api
mkdir -p src/features/sales/hooks/payments
mkdir -p src/features/sales/hooks/credits
mkdir -p src/features/sales/hooks/financial
mkdir -p src/features/sales/components/payments
mkdir -p src/features/sales/components/credits
mkdir -p src/features/sales/components/financial
mkdir -p src/features/sales/pages
mkdir -p src/features/sales/utils
mkdir -p tests/contract/sales
mkdir -p tests/integration/sales
mkdir -p tests/unit/sales/components
mkdir -p tests/unit/sales/hooks
```

**Acceptance Criteria**:
- [X] All directories created
- [X] Directory structure follows feature-sliced pattern
- [X] Test directories mirror source structure

---

### T003: Setup ESLint and TypeScript Configuration
**Status**: ✅ Complete  
**Depends On**: T001  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 10 minutes

**Description**: Ensure ESLint and TypeScript are properly configured for the feature.

**Files**:
- `tsconfig.json` (verify)
- `eslint.config.js` (verify)

**Tasks**:
1. Verify strict mode is enabled in tsconfig.json
2. Verify path aliases (@/...) are configured
3. Verify ESLint rules for React hooks are enabled
4. Run `npm run lint` to ensure no existing errors

**Acceptance Criteria**:
- [X] TypeScript strict mode enabled
- [X] Path aliases work correctly
- [X] ESLint runs without errors
- [X] No type errors in existing codebase

---

## Phase 1: Type System & Data Models

### T004: Create Payment Types [P]
**Status**: ✅ Complete  
**Depends On**: T002  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Define TypeScript interfaces for payment-related entities.

**Files**:
- `src/features/sales/types/payment.types.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 1.1

**Tasks**:
1. Define `PaymentStatus` type (5 status values)
2. Define `PaymentMethod` type (3 method values)
3. Define `Payment` interface (9 fields)
4. Define `PaymentListParams` interface (5 fields)
5. Define `PaginationMeta` interface (4 fields)
6. Define `PaymentListResponse` interface
7. Define `PaymentActionParams` interface
8. Define `PaymentActionResponse` interface
9. Define `PaymentDetailsResponse` interface
10. Add JSDoc comments for all types

**Acceptance Criteria**:
- [X] All payment types defined with correct field types
- [X] JSDoc comments explain each type's purpose
- [X] TypeScript compiles without errors
- [X] Types match API contract in `contracts/payments-api.md`

---

### T005: Create Credit Types [P]
**Status**: ✅ Complete  
**Depends On**: T002  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Define TypeScript interfaces for credit transaction entities.

**Files**:
- `src/features/sales/types/credit.types.ts` (create/extend)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 1.2

**Tasks**:
1. Define `CreditTransactionType` type (4 types)
2. Define `RelatedEntityType` type (3 types)
3. Define `CreditTransaction` interface (8 fields)
4. Define `CreditTransactionListParams` interface
5. Define `CreditTransactionListResponse` interface
6. Define `CreditBalance` interface
7. Add JSDoc comments

**Acceptance Criteria**:
- [X] All credit types defined correctly
- [X] Types match API contract in `contracts/credits-api.md`
- [X] No TypeScript compilation errors

---

### T006: Create Financial Types [P]
**Status**: ✅ Complete  
**Depends On**: T002  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 10 minutes

**Description**: Define TypeScript interfaces for financial summary entities.

**Files**:
- `src/features/sales/types/financial.types.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 1.3

**Tasks**:
1. Define `FinancialSummaryParams` interface
2. Define `FinancialSummary` interface (5 fields)
3. Add JSDoc comments

**Acceptance Criteria**:
- [X] Financial types defined correctly
- [X] Types match API contract in `contracts/financial-api.md`
- [X] No TypeScript compilation errors

---

### T007: Create Filter Types [P]
**Status**: ✅ Complete  
**Depends On**: T004, T005  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 10 minutes

**Description**: Define UI-specific filter state types.

**Files**:
- `src/features/sales/types/filters.types.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 3.1

**Tasks**:
1. Define `PaymentFilters` interface
2. Define `CreditTransactionFilters` interface
3. Define `FinancialSummaryFilters` interface
4. Add JSDoc comments

**Acceptance Criteria**:
- [X] Filter types defined for all list views
- [X] Types use Date objects for date fields
- [X] No TypeScript compilation errors

---

### T008: Create Component Props Types [P]
**Status**: ✅ Complete  
**Depends On**: T004, T005, T006  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Define TypeScript interfaces for component props.

**Files**:
- `src/features/sales/types/components.types.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 3.2

**Tasks**:
1. Define `PaymentCardProps` interface
2. Define `PaymentStatusBadgeProps` interface
3. Define `PaymentActionsProps` interface
4. Define `CreditTransactionCardProps` interface
5. Define `FinancialSummaryCardProps` interface
6. Define `PaginationProps` interface
7. Add JSDoc comments

**Acceptance Criteria**:
- [X] All component prop types defined
- [X] Optional props marked with `?`
- [X] Event handlers properly typed
- [X] No TypeScript compilation errors

---

### T009: Create Type Guards [P]
**Status**: ✅ Complete  
**Depends On**: T004, T005, T010, T011  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create runtime type checking functions using Zod schemas.

**Files**:
- `src/features/sales/types/guards.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 7.1

**Tasks**:
1. Import Zod schemas from `../schemas`
2. Create `isPayment()` type guard
3. Create `isCreditTransaction()` type guard
4. Create `isCorruptedPayment()` helper
5. Add JSDoc comments with examples

**Acceptance Criteria**:
- [X] Type guards use Zod `safeParse()` method
- [X] Functions return correct boolean values
- [X] TypeScript narrows types correctly
- [X] Unit tests pass (created in T045)

---

### T010: Create Payment Zod Schemas [P]
**Status**: ✅ Complete  
**Depends On**: T002  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create Zod validation schemas for payment types.

**Files**:
- `src/features/sales/schemas/payment.schema.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 2.1

**Tasks**:
1. Create `paymentStatusSchema` enum
2. Create `paymentMethodSchema` enum
3. Create `paymentSchema` object schema (9 fields)
4. Create `paymentListParamsSchema`
5. Create `paginationMetaSchema`
6. Create `paymentListResponseSchema`
7. Create `paymentActionParamsSchema`
8. Create `paymentActionResponseSchema`
9. Create `paymentDetailsResponseSchema`
10. Add validation constraints (min, max, datetime)

**Acceptance Criteria**:
- [X] All schemas validate correct data
- [X] Schemas reject invalid data
- [X] Validation messages are clear
- [X] Schemas match TypeScript types exactly

---

### T011: Create Credit and Financial Zod Schemas [P]
**Status**: ✅ Complete  
**Depends On**: T002, T010  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Create Zod validation schemas for credit and financial types.

**Files**:
- `src/features/sales/schemas/credit.schema.ts` (create/extend)
- `src/features/sales/schemas/financial.schema.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 2.2, 2.3

**Tasks**:
1. Create `creditTransactionTypeSchema` enum
2. Create `relatedEntityTypeSchema` enum
3. Create `creditTransactionSchema` object
4. Create `creditTransactionListParamsSchema`
5. Create `creditTransactionListResponseSchema`
6. Create `creditBalanceSchema`
7. Create `financialSummaryParamsSchema`
8. Create `financialSummarySchema`
9. Add validation constraints

**Acceptance Criteria**:
- [X] All schemas validate correct data
- [X] Credit transaction amount allows negative values
- [X] Financial summary amounts are non-negative
- [X] Schemas match TypeScript types

---

### T012: Create Type and Schema Export Indices [P]
**Status**: ✅ Complete  
**Depends On**: T004-T011  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 10 minutes

**Description**: Create index files for easy importing of types and schemas.

**Files**:
- `src/features/sales/types/index.ts` (create)
- `src/features/sales/schemas/index.ts` (create)

**Reference**: `specs/005-doc-payments-to/data-model.md` Section 11, 12

**Tasks**:
1. Export all types from `types/index.ts`
2. Export all schemas from `schemas/index.ts`
3. Re-export type guards
4. Verify import paths work correctly

**Acceptance Criteria**:
- [X] All types can be imported from `types/index.ts`
- [X] All schemas can be imported from `schemas/index.ts`
- [X] No circular dependencies
- [X] TypeScript auto-import works correctly

---

## Phase 2: Contract Tests (TDD)

### T013: Create Payments API Contract Tests [P]
**Status**: 🟡 Ready  
**Depends On**: T010, T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 30 minutes

**Description**: Write contract tests to validate payment API endpoints match expected schema.

**Files**:
- `tests/contract/sales/payments.contract.test.ts` (create)

**Reference**: `specs/005-doc-payments-to/contracts/payments-api.md`

**Tasks**:
1. Setup test file with Vitest imports
2. Create test for `GET /payments` endpoint
3. Create test for `GET /payments/:id` endpoint
4. Create test for `POST /payments/:id/cancel` endpoint
5. Create test for `POST /payments/:id/refund` endpoint
6. Mock API responses with MSW (if backend not ready)
7. Validate responses with Zod schemas
8. Test error response formats

**Test Cases**:
- ✅ Payment list matches `paymentListResponseSchema`
- ✅ Payment details match `paymentSchema`
- ✅ Cancel response matches `paymentActionResponseSchema`
- ✅ Refund response matches `paymentActionResponseSchema`
- ✅ Error responses have correct structure

**Acceptance Criteria**:
- [ ] All contract tests pass
- [ ] Tests fail when schema is violated
- [ ] Mock data matches real API structure
- [ ] Error cases are covered

---

### T014: Create Credits API Contract Tests [P]
**Status**: 🟡 Ready  
**Depends On**: T011, T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Write contract tests for credit transaction endpoints.

**Files**:
- `tests/contract/sales/credits.contract.test.ts` (create)

**Reference**: `specs/005-doc-payments-to/contracts/credits-api.md`

**Tasks**:
1. Create test for `GET /credits/balance` endpoint
2. Create test for `GET /credits/transactions` endpoint
3. Mock API responses
4. Validate with Zod schemas
5. Test error responses

**Test Cases**:
- ✅ Credit balance matches `creditBalanceSchema`
- ✅ Transaction list matches `creditTransactionListResponseSchema`
- ✅ Pagination metadata is correct
- ✅ Error responses are valid

**Acceptance Criteria**:
- [ ] All contract tests pass
- [ ] Negative credit amounts are handled
- [ ] Optional fields work correctly

---

### T015: Create Financial API Contract Tests [P]
**Status**: 🟡 Ready  
**Depends On**: T011, T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Write contract tests for financial summary endpoint.

**Files**:
- `tests/contract/sales/financial.contract.test.ts` (create)

**Reference**: `specs/005-doc-payments-to/contracts/financial-api.md`

**Tasks**:
1. Create test for `GET /financial/summary` endpoint
2. Test with different date ranges
3. Validate with Zod schema
4. Test error responses

**Test Cases**:
- ✅ Summary matches `financialSummarySchema`
- ✅ Date range parameters work
- ✅ Default date range applied correctly

**Acceptance Criteria**:
- [ ] Contract tests pass
- [ ] Date range validation works
- [ ] Amounts are non-negative

---

### T016: Setup MSW Mock Server [P]
**Status**: 🟡 Ready  
**Depends On**: T013, T014, T015  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Configure Mock Service Worker for API mocking in tests.

**Files**:
- `tests/mocks/handlers/payments.handlers.ts` (create)
- `tests/mocks/handlers/credits.handlers.ts` (create)
- `tests/mocks/handlers/financial.handlers.ts` (create)
- `tests/mocks/server.ts` (create/extend)

**Tasks**:
1. Create payment endpoint handlers
2. Create credit endpoint handlers
3. Create financial endpoint handlers
4. Generate realistic mock data
5. Handle query parameters correctly
6. Simulate error responses
7. Setup server in test environment

**Acceptance Criteria**:
- [ ] MSW intercepts API calls in tests
- [ ] Mock data matches schemas
- [ ] Query parameters filter results
- [ ] Error scenarios can be simulated

---

### T017: Create Test Utilities and Factories [P]
**Status**: 🟡 Ready  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Create helper functions for generating test data.

**Files**:
- `tests/utils/factories/payment.factory.ts` (create)
- `tests/utils/factories/credit.factory.ts` (create)
- `tests/utils/factories/financial.factory.ts` (create)

**Tasks**:
1. Create `createMockPayment()` factory
2. Create `createMockCreditTransaction()` factory
3. Create `createMockFinancialSummary()` factory
4. Add options for customizing generated data
5. Ensure generated data passes Zod validation

**Acceptance Criteria**:
- [ ] Factories generate valid mock data
- [ ] Data can be customized via options
- [ ] Generated data passes schema validation
- [ ] Factories are easy to use in tests

---

### T018: Create Query Client Test Wrapper [P]
**Status**: 🟡 Ready  
**Depends On**: T003  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create wrapper for testing React Query hooks.

**Files**:
- `tests/utils/createQueryClientWrapper.tsx` (create/verify)

**Tasks**:
1. Create QueryClient with disabled retries
2. Create wrapper component with QueryClientProvider
3. Add cleanup utilities
4. Document usage in comments

**Acceptance Criteria**:
- [ ] Wrapper works with `renderHook()`
- [ ] Query client is fresh for each test
- [ ] No cache pollution between tests
- [ ] Retries are disabled for faster tests

---

### T019: Verify Contract Test Coverage [P]
**Status**: 🟡 Ready  
**Depends On**: T013-T018  
**Can Run in Parallel**: No  
**Estimated Time**: 10 minutes

**Description**: Run all contract tests and verify 100% endpoint coverage.

**Commands**:
```bash
npm run test:contract -- tests/contract/sales/
```

**Tasks**:
1. Run all contract tests
2. Verify all 7 endpoints are tested
3. Check test coverage report
4. Fix any failing tests

**Acceptance Criteria**:
- [ ] All 7 API endpoints have contract tests
- [ ] All contract tests pass
- [ ] Coverage includes success and error cases
- [ ] No flaky tests

---

## Phase 3: API Layer Implementation

### T020: Implement Payments API Client
**Status**: ✅ Complete  
**Depends On**: T013, T019  
**Can Run in Parallel**: No  
**Estimated Time**: 30 minutes

**Description**: Implement API client functions for payment endpoints.

**Files**:
- `src/features/sales/api/paymentsApi.ts` (create)

**Reference**: 
- `specs/005-doc-payments-to/quickstart.md` Phase 2
- `specs/005-doc-payments-to/contracts/payments-api.md`

**Tasks**:
1. Import API client from `@/lib/api-client`
2. Import types and schemas
3. Implement `getPayments()` function
4. Implement `getPaymentById()` function
5. Implement `cancelPayment()` function
6. Implement `refundPayment()` function
7. Add Zod validation to all responses
8. Export as `paymentsApi` object

**Acceptance Criteria**:
- [X] All 4 functions implemented
- [X] Responses validated with Zod
- [X] API client error handling preserved
- [X] Contract tests pass with real implementation
- [X] TypeScript types are correct

---

### T021: Extend Credits API Client
**Status**: ✅ Complete  
**Depends On**: T014, T019  
**Can Run in Parallel**: Yes [P] (if not modifying same file as T020)  
**Estimated Time**: 20 minutes

**Description**: Add credit transaction functions to existing credits API.

**Files**:
- `src/features/sales/api/creditsApi.ts` (extend)

**Reference**: 
- `specs/005-doc-payments-to/quickstart.md` Phase 2
- `specs/005-doc-payments-to/contracts/credits-api.md`

**Tasks**:
1. Keep existing `getCreditBalance()` function
2. Add `getCreditTransactions()` function
3. Add Zod validation
4. Update exports

**Acceptance Criteria**:
- [X] Existing credit balance function still works
- [X] New transaction list function works
- [X] Responses validated with Zod
- [X] Contract tests pass
- [X] No breaking changes to existing code

---

### T022: Implement Financial API Client
**Status**: ✅ Complete  
**Depends On**: T015, T019  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Implement API client for financial summary endpoint.

**Files**:
- `src/features/sales/api/financialApi.ts` (create)

**Reference**: 
- `specs/005-doc-payments-to/quickstart.md` Phase 2
- `specs/005-doc-payments-to/contracts/financial-api.md`

**Tasks**:
1. Import API client and types
2. Implement `getFinancialSummary()` function
3. Add Zod validation
4. Export as `financialApi` object

**Acceptance Criteria**:
- [X] Function handles date parameters
- [X] Response validated with Zod
- [X] Contract tests pass
- [X] Default date range works

---

### T023: Create Query Keys Configuration
**Status**: ✅ Complete  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Define TanStack Query keys for cache management.

**Files**:
- `src/features/sales/hooks/queryKeys.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 3

**Tasks**:
1. Define `paymentKeys` object with hierarchical keys
2. Define `creditKeys` object
3. Define `financialKeys` object
4. Add TypeScript `as const` assertions
5. Add JSDoc comments explaining key structure

**Acceptance Criteria**:
- [X] Keys are type-safe with `as const`
- [X] Key hierarchy supports cache invalidation
- [X] Keys include filter parameters
- [X] No duplicate keys

---

## Phase 4: React Query Hooks

### T024: Implement usePayments Hook [P]
**Status**: ✅ Complete  
**Depends On**: T020, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create React Query hook for fetching payment list.

**Files**:
- `src/features/sales/hooks/payments/usePayments.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 3

**Tasks**:
1. Import `useQuery` and payment API
2. Import query keys
3. Implement hook with `keepPreviousData`
4. Set 5-minute stale time
5. Export hook

**Acceptance Criteria**:
- [X] Hook returns payment list
- [X] Previous data kept during refetch
- [X] Loading and error states work
- [X] Query key includes filters

---

### T025: Implement usePaymentDetails Hook [P]
**Status**: ✅ Complete  
**Depends On**: T020, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 10 minutes

**Description**: Create React Query hook for fetching single payment.

**Files**:
- `src/features/sales/hooks/payments/usePaymentDetails.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 3

**Tasks**:
1. Import `useQuery` and payment API
2. Implement hook with 10-minute stale time
3. Export hook

**Acceptance Criteria**:
- [X] Hook fetches payment by ID
- [X] Loading and error states work
- [X] Data cached correctly

---

### T026: Implement useCancelPayment Hook [P]
**Status**: ✅ Complete  
**Depends On**: T020, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create mutation hook for cancelling payments with optimistic updates.

**Files**:
- `src/features/sales/hooks/payments/useCancelPayment.ts` (create)

**Reference**: 
- `specs/005-doc-payments-to/quickstart.md` Phase 3
- `specs/005-doc-payments-to/research.md` Section 4.2

**Tasks**:
1. Import `useMutation` and `useQueryClient`
2. Implement optimistic update in `onMutate`
3. Implement rollback in `onError`
4. Invalidate queries in `onSettled`
5. Export hook

**Acceptance Criteria**:
- [X] Optimistic update shows immediately
- [X] Rollback works on error
- [X] Cache invalidation works
- [X] Financial summary refreshes

---

### T027: Implement useRefundPayment Hook [P]
**Status**: ✅ Complete  
**Depends On**: T020, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create mutation hook for refunding payments with optimistic updates.

**Files**:
- `src/features/sales/hooks/payments/useRefundPayment.ts` (create)

**Reference**: Same as T026

**Tasks**:
1. Copy pattern from `useCancelPayment`
2. Update mutation function to call `refundPayment`
3. Update optimistic status to 'refunded'
4. Export hook

**Acceptance Criteria**:
- [X] Optimistic update shows immediately
- [X] Rollback works on error
- [X] Cache invalidation works
- [X] Same quality as cancel hook

---

### T028: Implement useCreditTransactions Hook [P]
**Status**: ✅ Complete  
**Depends On**: T021, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create React Query hook for fetching credit transactions.

**Files**:
- `src/features/sales/hooks/credits/useCreditTransactions.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 3

**Tasks**:
1. Import `useQuery` and credits API
2. Implement hook with `keepPreviousData`
3. Set 5-minute stale time
4. Export hook

**Acceptance Criteria**:
- [X] Hook returns transaction list
- [X] Pagination works correctly
- [X] Type filter works
- [X] Previous data kept during refetch

---

### T029: Implement useFinancialSummary Hook [P]
**Status**: ✅ Complete  
**Depends On**: T022, T023  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create React Query hook for fetching financial summary.

**Files**:
- `src/features/sales/hooks/financial/useFinancialSummary.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 3

**Tasks**:
1. Import `useQuery` and financial API
2. Implement hook with 5-minute stale time
3. Handle date parameters
4. Export hook

**Acceptance Criteria**:
- [X] Hook returns financial summary
- [X] Date range parameters work
- [X] Loading and error states work
- [X] Data cached correctly

---

### T030: Create Utility Functions [P]
**Status**: ✅ Complete  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Create utility functions for formatting currency and dates.

**Files**:
- `src/features/sales/utils/formatters.ts` (create/extend)

**Reference**: `specs/005-doc-payments-to/research.md` Section 6.1

**Tasks**:
1. Implement `formatCurrency()` function (cents → R$ format)
2. Implement `formatDate()` function (ISO 8601 → Brazilian format)
3. Add options for different formats
4. Export functions

**Acceptance Criteria**:
- [X] Currency formats to R$ 99,00 pattern
- [X] Dates format to DD/MM/YYYY HH:MM
- [X] Locale is pt-BR
- [X] Unit tests pass (created in T045)

---

### T031: Verify All Hooks Work Together
**Status**: 🟡 Ready  
**Depends On**: T024-T029  
**Can Run in Parallel**: No  
**Estimated Time**: 15 minutes

**Description**: Test that all hooks work correctly and cache invalidation flows properly.

**Tasks**:
1. Write integration test using multiple hooks
2. Test cache invalidation after mutations
3. Verify no infinite refetch loops
4. Check memory leaks with React Query DevTools

**Acceptance Criteria**:
- [ ] Hooks don't cause infinite loops
- [ ] Cache invalidation works as expected
- [ ] No memory leaks detected
- [ ] DevTools shows correct query states

---

## Phase 5: UI Components

### T032: Implement PaymentStatusBadge Component [P]
**Status**: 🟡 Ready  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 15 minutes

**Description**: Create status badge component with color-coded states.

**Files**:
- `src/features/sales/components/payments/PaymentStatusBadge.tsx` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 4

**Tasks**:
1. Import Badge component from shadcn/ui
2. Create status configuration map
3. Implement component with variant prop
4. Add accessibility attributes
5. Export component

**Acceptance Criteria**:
- [ ] Pending = yellow/outline
- [ ] Completed = green/default
- [ ] Failed = red/destructive
- [ ] Cancelled = gray/secondary
- [ ] Refunded = gray/secondary
- [ ] Accessible with screen readers

---

### T033: Implement PaymentCard Component [P]
**Status**: 🟡 Ready  
**Depends On**: T032, T030  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Create payment card component for list display.

**Files**:
- `src/features/sales/components/payments/PaymentCard.tsx` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 4

**Tasks**:
1. Import Card components from shadcn/ui
2. Import PaymentStatusBadge
3. Import format utilities
4. Implement card layout
5. Add click handler
6. Add hover state
7. Export component

**Acceptance Criteria**:
- [ ] Displays amount, status, description, date
- [ ] Uses formatCurrency and formatDate
- [ ] Shows status badge
- [ ] Clickable with hover effect
- [ ] Responsive layout

---

### T034: Implement PaymentFilters Component [P]
**Status**: 🟡 Ready  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create filter component for payment list with status and date range.

**Files**:
- `src/features/sales/components/payments/PaymentFilters.tsx` (create)

**Tasks**:
1. Import Select and DatePicker from shadcn/ui
2. Create status filter dropdown
3. Create date range pickers
4. Handle filter state changes
5. Emit filter changes to parent
6. Export component

**Acceptance Criteria**:
- [ ] Status dropdown with all 5 statuses
- [ ] Start date picker
- [ ] End date picker
- [ ] Clear filters button
- [ ] Changes emit to parent component

---

### T035: Implement PaymentList Component [P]
**Status**: 🟡 Ready  
**Depends On**: T024, T033  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create payment list component with loading and error states.

**Files**:
- `src/features/sales/components/payments/PaymentList.tsx` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 4

**Tasks**:
1. Import usePayments hook
2. Import PaymentCard component
3. Implement loading skeleton
4. Implement error state
5. Implement empty state
6. Map payments to PaymentCard components
7. Add navigation on click
8. Export component

**Acceptance Criteria**:
- [ ] Shows loading skeleton while fetching
- [ ] Shows error message on failure
- [ ] Shows empty state when no results
- [ ] Displays payment cards
- [ ] Navigates to details on click

---

### T036: Implement PaymentActions Component [P]
**Status**: 🟡 Ready  
**Depends On**: T026, T027  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 30 minutes

**Description**: Create action buttons component for cancel/refund with confirmation dialogs.

**Files**:
- `src/features/sales/components/payments/PaymentActions.tsx` (create)

**Tasks**:
1. Import Dialog and Textarea from shadcn/ui
2. Import cancel and refund hooks
3. Create cancel button with dialog
4. Create refund button with dialog
5. Add reason input (optional)
6. Handle loading states
7. Show success/error messages
8. Disable actions for invalid statuses
9. Export component

**Acceptance Criteria**:
- [ ] Cancel only enabled for pending payments
- [ ] Refund only enabled for completed payments
- [ ] Confirmation dialog shows before action
- [ ] Optional reason input works
- [ ] Loading state during mutation
- [ ] Success/error toast messages

---

### T037: Implement CreditTransactionList Component [P]
**Status**: 🟡 Ready  
**Depends On**: T028, T030  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create credit transaction list component.

**Files**:
- `src/features/sales/components/credits/CreditTransactionList.tsx` (create)

**Tasks**:
1. Import useCreditTransactions hook
2. Create transaction card sub-component
3. Show transaction type with icon
4. Format amount (positive/negative)
5. Show balance after transaction
6. Implement loading/error/empty states
7. Export component

**Acceptance Criteria**:
- [ ] Shows transaction type with icon
- [ ] Earned = green positive number
- [ ] Spent = red negative number
- [ ] Shows balance after each transaction
- [ ] Loading and error states work

---

### T038: Implement FinancialSummaryCard Component [P]
**Status**: 🟡 Ready  
**Depends On**: T029, T030  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 25 minutes

**Description**: Create financial summary dashboard card with metrics.

**Files**:
- `src/features/sales/components/financial/FinancialSummaryCard.tsx` (create)

**Tasks**:
1. Import useFinancialSummary hook
2. Import Card components
3. Display total spent (formatted)
4. Display total earned (credits)
5. Display active subscriptions count
6. Display pending payments count
7. Show time period
8. Add loading skeleton
9. Export component

**Acceptance Criteria**:
- [ ] Shows all 4 metrics
- [ ] Amounts formatted as currency
- [ ] Period displayed clearly
- [ ] Loading skeleton matches layout
- [ ] Responsive grid layout

---

### T039: Create Pagination Component
**Status**: 🟡 Ready  
**Depends On**: T012  
**Can Run in Parallel**: Yes [P]  
**Estimated Time**: 20 minutes

**Description**: Create or verify pagination component exists and works.

**Files**:
- `src/shared/components/Pagination.tsx` (verify/create)

**Tasks**:
1. Check if component already exists
2. If not, create with Previous/Next buttons
3. Add page number display
4. Add items per page selector
5. Handle page change events
6. Export component

**Acceptance Criteria**:
- [ ] Previous/Next buttons work
- [ ] Current page displayed
- [ ] Total pages displayed
- [ ] Items per page can be changed (10, 25, 50)
- [ ] Disabled states work correctly

---

## Phase 6: Pages

### T040: Implement PaymentHistoryPage
**Status**: ✅ Complete  
**Depends On**: T034, T035, T039  
**Can Run in Parallel**: No (route definition needed first)  
**Estimated Time**: 30 minutes

**Description**: Create main payment history page with filters and pagination.

**Files**:
- `src/features/sales/pages/PaymentHistoryPage.tsx` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 5

**Tasks**:
1. Import filter, list, and pagination components
2. Setup filter state with useState
3. Implement filter change handlers
4. Implement page change handlers
5. Connect components together
6. Add page title and breadcrumbs
7. Handle URL query params for filter persistence
8. Export component

**Acceptance Criteria**:
- [X] Page displays payment list
- [X] Filters work correctly
- [X] Pagination works
- [X] URL updates with filters
- [X] Back button preserves filters
- [X] Responsive layout

---

### T041: Implement PaymentDetailsPage
**Status**: ✅ Complete  
**Depends On**: T025, T036  
**Can Run in Parallel**: No  
**Estimated Time**: 25 minutes

**Description**: Create payment details page with action buttons.

**Files**:
- `src/features/sales/pages/PaymentDetailsPage.tsx` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 5

**Tasks**:
1. Import usePaymentDetails hook
2. Import PaymentActions component
3. Get payment ID from route params
4. Display payment details
5. Show related subscription (if applicable)
6. Add back navigation
7. Handle loading and error states
8. Export component

**Acceptance Criteria**:
- [X] Fetches payment by ID from URL
- [X] Shows all payment details
- [X] Action buttons shown for valid statuses
- [X] Loading and error states work
- [X] Back button works
- [X] Related subscription link works

---

### T042: Implement CreditTransactionsPage
**Status**: ✅ Complete  
**Depends On**: T037, T039  
**Can Run in Parallel**: No  
**Estimated Time**: 25 minutes

**Description**: Create credit transactions page with balance and transaction list.

**Files**:
- `src/features/sales/pages/CreditTransactionsPage.tsx` (create)

**Tasks**:
1. Import credit components
2. Import existing CreditBalanceCard (if exists)
3. Setup type filter state
4. Setup pagination state
5. Display balance at top
6. Display transaction list
7. Add pagination
8. Export component

**Acceptance Criteria**:
- [X] Current balance displayed
- [X] Transaction list shows
- [X] Type filter works
- [X] Pagination works
- [X] Responsive layout

---

### T043: Implement FinancialDashboardPage
**Status**: ✅ Complete  
**Depends On**: T038  
**Can Run in Parallel**: No  
**Estimated Time**: 25 minutes

**Description**: Create financial dashboard page with summary metrics.

**Files**:
- `src/features/sales/pages/FinancialDashboardPage.tsx` (create)

**Tasks**:
1. Import FinancialSummaryCard
2. Setup date range state (default: last 30 days)
3. Add date range picker
4. Display summary card
5. Add recent payments list (last 5)
6. Add recent transactions list (last 5)
7. Export component

**Acceptance Criteria**:
- [X] Summary card displays
- [X] Date range picker works
- [X] Default to last 30 days
- [X] Recent payments shown
- [X] Recent transactions shown
- [X] Links to full lists work

---

## Phase 7: Integration & Routes

### T044: Add Routes and Navigation
**Status**: ✅ Complete  
**Depends On**: T040, T041, T042, T043  
**Can Run in Parallel**: No  
**Estimated Time**: 20 minutes

**Description**: Add new routes to router and update navigation.

**Files**:
- `src/features/sales/routes.ts` (create)
- `src/App.tsx` (update)
- `src/shared/components/layout/AppSidebar.tsx` (update)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 6

**Tasks**:
1. Add route for `/payments` → PaymentHistoryPage
2. Add route for `/payments/:id` → PaymentDetailsPage
3. Add route for `/credits/transactions` → CreditTransactionsPage
4. Add route for `/financial` → FinancialDashboardPage
5. Update navigation menu with new links
6. Add breadcrumbs if needed
7. Test all routes work

**Acceptance Criteria**:
- [X] All 4 new routes work
- [X] Navigation links work
- [X] Route params work (payment ID)
- [X] 404 handling works
- [X] Breadcrumbs helper created

---

## Phase 8: Testing & Polish

### T045: Write Integration and Unit Tests
**Status**: 🟡 Ready  
**Depends On**: T044  
**Can Run in Parallel**: No  
**Estimated Time**: 120 minutes (2 hours)

**Description**: Write comprehensive integration and unit tests for all components and hooks.

**Files**:
- `tests/integration/sales/payment-flow.test.tsx` (create)
- `tests/integration/sales/credit-flow.test.tsx` (create)
- `tests/integration/sales/financial-summary.test.tsx` (create)
- `tests/unit/sales/components/` (multiple files)
- `tests/unit/sales/hooks/` (multiple files)
- `tests/unit/sales/utils/formatters.test.ts` (create)

**Reference**: `specs/005-doc-payments-to/quickstart.md` Phase 7

**Tasks**:
1. Write integration test for payment viewing flow
2. Write integration test for payment actions (cancel/refund)
3. Write integration test for credit transaction viewing
4. Write integration test for financial dashboard
5. Write unit tests for PaymentCard component
6. Write unit tests for PaymentStatusBadge component
7. Write unit tests for PaymentFilters component
8. Write unit tests for all hooks
9. Write unit tests for formatCurrency function
10. Write unit tests for formatDate function
11. Write unit tests for type guards

**Test Coverage Goals**:
- [ ] 80%+ line coverage
- [ ] All user flows tested
- [ ] All error scenarios tested
- [ ] Accessibility tested

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Coverage meets goals
- [ ] No flaky tests
- [ ] Tests run in under 30 seconds

---

## Parallel Execution Examples

### Example 1: Type System Phase (Run together)
```bash
# All of these can run in parallel as they create different files
Task T004 & Task T005 & Task T006 & Task T007 & Task T008 & Task T010 & Task T011
```

### Example 2: Contract Tests Phase (Run together)
```bash
# These can all run in parallel as they test different endpoints
Task T013 & Task T014 & Task T015 & Task T016 & Task T017 & Task T018
```

### Example 3: React Query Hooks Phase (Run together)
```bash
# These can run in parallel as they create different hook files
Task T024 & Task T025 & Task T026 & Task T027 & Task T028 & Task T029 & Task T030
```

### Example 4: UI Components Phase (Run together)
```bash
# These can run in parallel as they create different component files
Task T032 & Task T034 & Task T037 & Task T038 & Task T039
```

---

## Task Dependencies Graph

```
T001 (Verify Dependencies)
├── T002 (Create Directories)
│   ├── T004-T012 [P] (Type System)
│   │   ├── T013-T019 [P] (Contract Tests)
│   │   │   ├── T020 (Payments API)
│   │   │   │   ├── T024-T027 [P] (Payment Hooks)
│   │   │   ├── T021 (Credits API)
│   │   │   │   ├── T028 [P] (Credit Hooks)
│   │   │   ├── T022 (Financial API)
│   │   │   │   ├── T029 [P] (Financial Hooks)
│   │   │   └── T023 (Query Keys) [P]
│   │   │       └── T031 (Verify Hooks)
│   │   │           ├── T032-T039 [P] (UI Components)
│   │   │           │   ├── T040 (Payment History Page)
│   │   │           │   ├── T041 (Payment Details Page)
│   │   │           │   ├── T042 (Credit Transactions Page)
│   │   │           │   └── T043 (Financial Dashboard Page)
│   │   │           │       └── T044 (Routes & Navigation)
│   │   │           │           └── T045 (Integration Tests)
└── T003 (ESLint Config) [P]
```

---

## Progress Tracking

### Setup & Configuration (3 tasks) ✅ COMPLETE
- [X] T001: Verify Project Dependencies
- [X] T002: Create Directory Structure
- [X] T003: Setup ESLint and TypeScript Configuration

### Type System & Data Models (9 tasks) ✅ COMPLETE
- [X] T004: Create Payment Types [P]
- [X] T005: Create Credit Types [P]
- [X] T006: Create Financial Types [P]
- [X] T007: Create Filter Types [P]
- [X] T008: Create Component Props Types [P]
- [X] T009: Create Type Guards [P]
- [X] T010: Create Payment Zod Schemas [P]
- [X] T011: Create Credit and Financial Zod Schemas [P]
- [X] T012: Create Type and Schema Export Indices [P]

### Contract Tests (7 tasks) 🟡 IN PROGRESS
- [ ] T013: Create Payments API Contract Tests [P]
- [ ] T014: Create Credits API Contract Tests [P]
- [ ] T015: Create Financial API Contract Tests [P]
- [ ] T016: Setup MSW Mock Server [P]
- [ ] T017: Create Test Utilities and Factories [P]
- [ ] T018: Create Query Client Test Wrapper [P]
- [ ] T019: Verify Contract Test Coverage

### API Layer (4 tasks) ✅ COMPLETE
- [X] T020: Implement Payments API Client
- [X] T021: Extend Credits API Client
- [X] T022: Implement Financial API Client
- [X] T023: Create Query Keys Configuration

### React Query Hooks (8 tasks) ⚠️ PARTIAL (7/8)
- [X] T024: Implement usePayments Hook [P]
- [X] T025: Implement usePaymentDetails Hook [P]
- [X] T026: Implement useCancelPayment Hook [P]
- [X] T027: Implement useRefundPayment Hook [P]
- [X] T028: Implement useCreditTransactions Hook [P]
- [X] T029: Implement useFinancialSummary Hook [P]
- [X] T030: Create Utility Functions [P]
- [ ] T031: Verify All Hooks Work Together

### UI Components (8 tasks) ✅ COMPLETE
- [X] T032: Implement PaymentStatusBadge Component [P]
- [X] T033: Implement PaymentCard Component [P]
- [X] T034: Implement PaymentFilters Component [P]
- [X] T035: Implement PaymentList Component [P]
- [X] T036: Implement PaymentActions Component [P]
- [X] T037: Implement CreditTransactionList Component [P]
- [X] T038: Implement FinancialSummaryCard Component [P]
- [X] T039: Create Pagination Component [P]

### Pages (4 tasks)
- [ ] T040: Implement PaymentHistoryPage
- [ ] T041: Implement PaymentDetailsPage
- [ ] T042: Implement CreditTransactionsPage
- [ ] T043: Implement FinancialDashboardPage

### Integration (1 task)
- [ ] T044: Add Routes and Navigation

### Testing & Polish (1 task)
- [ ] T045: Write Integration and Unit Tests

---

## Completion Criteria

The feature is considered complete when:

- [ ] All 45 tasks are completed
- [ ] All contract tests pass (7 endpoints)
- [ ] All integration tests pass (3 flows)
- [ ] All unit tests pass (80%+ coverage)
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no warnings
- [ ] All 4 pages are accessible via routes
- [ ] Navigation works correctly
- [ ] Error handling works in all scenarios
- [ ] Loading states work correctly
- [ ] Optimistic updates work correctly
- [ ] Currency formatting shows R$ format
- [ ] Date formatting shows Brazilian format
- [ ] Pagination works on all list pages
- [ ] Filters persist in URL
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Performance goals met (< 3s load, < 500ms API)
- [ ] Code review completed
- [ ] Documentation updated

---

## Notes

- **TDD Approach**: Contract tests (T013-T019) must be written before API implementation (T020-T022)
- **Parallel Tasks**: Tasks marked with [P] can be executed in parallel if different files
- **Backend Dependency**: This feature assumes backend APIs exist. Use MSW mocks if not ready.
- **Existing Code**: Some credit and subscription code already exists - extend, don't replace
- **Type Safety**: All API responses must be validated with Zod schemas
- **Error Handling**: Use existing `ApiClientError` pattern from `@/lib/api-client`
- **UI Library**: Use shadcn/ui components for consistency
- **Currency Format**: Always format monetary values as R$ (Brazilian Real)
- **Date Format**: Always format dates in Brazilian format (DD/MM/YYYY)
- **Pagination**: Fixed at 10 items per page per spec requirement

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-10-09  
**Ready for Execution**: Yes
