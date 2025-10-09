# Research - Payments, Subscriptions, and Credits Management

**Feature**: Payments, Subscriptions, and Credits Management  
**Spec**: `specs/005-doc-payments-to/spec.md`  
**Date**: 2025-01-08

---

## Executive Summary

This research document covers the technical decisions, architectural patterns, and implementation approaches for extending the existing `sales` feature to include comprehensive payment history, credit transaction tracking, and financial dashboard capabilities.

**Key Decisions**:
- Extend existing `sales` feature structure (no new feature module)
- Leverage TanStack Query v5 for all server state management
- Reuse existing API client with authorization headers
- Follow established component patterns from subscription/trial flows
- Implement client-side pagination with server-side filtering

---

## 1. Existing Architecture Analysis

### 1.1 Current Sales Feature Structure

**What Already Exists**:
```typescript
src/features/sales/
├── api/
│   ├── creditsApi.ts         // Credit balance queries
│   ├── subscriptionsApi.ts   // Trial activation, subscription status
│   └── productsApi.ts        // Plan/product listing
├── hooks/
│   ├── credits/
│   │   └── useCreditBalance.ts
│   ├── subscriptions/
│   │   ├── useSubscription.ts
│   │   ├── useTrialActivation.ts
│   │   └── useProduct.ts
├── components/
│   ├── subscriptions/
│   │   ├── CheckoutFlow/         // Multi-step trial activation
│   │   ├── SubscriptionDashboard/
│   │   └── TrialBanner.tsx
│   └── credits/
│       └── CreditBalanceCard.tsx
└── pages/
    ├── CheckoutPage.tsx           // Trial activation flow
    ├── PricingPage.tsx            // Plan selection
    └── SubscriptionManagementPage.tsx
```

**Established Patterns**:
1. **API Layer**: Axios-based functions in `api/` returning promises
2. **React Query Hooks**: Custom hooks wrapping `useQuery`/`useMutation`
3. **Type Safety**: Zod schemas + TypeScript interfaces
4. **Error Handling**: API client throws `ApiClientError` with structured messages
5. **Auth**: Automatic authorization headers via `api-client.ts` interceptor

### 1.2 API Client Capabilities

**File**: `src/lib/api-client.ts`

**Features**:
- Axios instance with base URL configuration
- Request interceptor: Adds `Authorization: Bearer <token>` header
- Response interceptor: Transforms errors into `ApiClientError` objects
- Error message extraction: Handles both `data.error` (string) and `data.error.message` (object)
- Status code mapping: 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 422 (Validation), 429 (Rate Limit), 500+ (Server Error)

**Decision**: No API client changes needed. Existing error handling and auth mechanisms are sufficient.

---

## 2. Backend API Contracts (Assumptions)

### 2.1 Payment History Endpoint

**Endpoint**: `GET /api/payments`

**Query Parameters**:
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 10
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  startDate?: string;     // ISO 8601 date
  endDate?: string;       // ISO 8601 date
}
```

**Response**:
```typescript
{
  payments: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

**Payment Object**:
```typescript
{
  id: string;
  amount: number;             // Cents (e.g., 9900 = R$ 99,00)
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  method: 'credit_card' | 'pix' | 'boleto';
  createdAt: string;          // ISO 8601
  updatedAt: string;
  description: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}
```

### 2.2 Payment Details Endpoint

**Endpoint**: `GET /api/payments/:id`

**Response**: Single `Payment` object with additional details

### 2.3 Payment Actions Endpoints

**Cancel Payment**: `POST /api/payments/:id/cancel`  
**Refund Payment**: `POST /api/payments/:id/refund`

**Request Body** (both):
```typescript
{
  reason?: string;  // Optional cancellation/refund reason
}
```

**Response**:
```typescript
{
  success: boolean;
  payment: Payment;  // Updated payment object
  message?: string;
}
```

### 2.4 Credit Transactions Endpoint

**Endpoint**: `GET /api/credits/transactions`

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
  type?: 'earned' | 'spent' | 'bonus' | 'refund';
}
```

**Response**:
```typescript
{
  transactions: CreditTransaction[];
  pagination: PaginationMeta;
}
```

**CreditTransaction Object**:
```typescript
{
  id: string;
  amount: number;             // Credit amount (positive or negative)
  type: 'earned' | 'spent' | 'bonus' | 'refund';
  description: string;
  createdAt: string;
  relatedEntityType?: 'payment' | 'subscription' | 'campaign';
  relatedEntityId?: string;
  balanceAfter: number;       // Balance after transaction
}
```

### 2.5 Financial Summary Endpoint

**Endpoint**: `GET /api/financial/summary`

**Query Parameters**:
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

**Response**:
```typescript
{
  totalSpent: number;         // Total amount in cents
  totalEarned: number;        // Credits earned
  activeSubscriptions: number;
  pendingPayments: number;
  period: {
    startDate: string;
    endDate: string;
  };
}
```

**Decision**: Document these contracts in `contracts/` folder. Validate with backend team during implementation.

---

## 3. Data Model Design

### 3.1 TypeScript Interfaces

**File**: `src/features/sales/types/payment.types.ts`

```typescript
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  description: string;
  subscriptionId?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: PaginationMeta;
}

export interface PaymentActionParams {
  reason?: string;
}

export interface PaymentActionResponse {
  success: boolean;
  payment: Payment;
  message?: string;
}
```

**File**: `src/features/sales/types/credit.types.ts` (extend existing)

```typescript
export type CreditTransactionType = 'earned' | 'spent' | 'bonus' | 'refund';
export type RelatedEntityType = 'payment' | 'subscription' | 'campaign';

export interface CreditTransaction {
  id: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  createdAt: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  balanceAfter: number;
}

export interface CreditTransactionListParams {
  page?: number;
  limit?: number;
  type?: CreditTransactionType;
}

export interface CreditTransactionListResponse {
  transactions: CreditTransaction[];
  pagination: PaginationMeta;
}
```

**File**: `src/features/sales/types/financial.types.ts` (new)

```typescript
export interface FinancialSummaryParams {
  startDate?: string;
  endDate?: string;
}

export interface FinancialSummary {
  totalSpent: number;
  totalEarned: number;
  activeSubscriptions: number;
  pendingPayments: number;
  period: {
    startDate: string;
    endDate: string;
  };
}
```

### 3.2 Zod Validation Schemas

**File**: `src/features/sales/schemas/payment.schema.ts`

```typescript
import { z } from 'zod';

export const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded'
]);

export const paymentMethodSchema = z.enum([
  'credit_card',
  'pix',
  'boleto'
]);

export const paymentSchema = z.object({
  id: z.string(),
  amount: z.number().int().positive(),
  status: paymentStatusSchema,
  method: paymentMethodSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string(),
  subscriptionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const paymentListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  status: paymentStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const paymentListResponseSchema = z.object({
  payments: z.array(paymentSchema),
  pagination: z.object({
    currentPage: z.number().int(),
    totalPages: z.number().int(),
    totalItems: z.number().int(),
    itemsPerPage: z.number().int(),
  }),
});
```

**Decision**: Use Zod schemas for runtime validation of API responses. This provides type safety and helps catch backend contract changes early.

---

## 4. State Management Strategy

### 4.1 TanStack Query Patterns

**Approach**: Use TanStack Query v5 for all server state management.

**Rationale**:
- Already established in project
- Handles caching, background refetching, and stale-while-revalidate
- Built-in loading/error states
- Optimistic updates for mutations

**Query Keys Strategy**:
```typescript
// src/features/sales/hooks/payments/queryKeys.ts
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: PaymentListParams) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

export const creditKeys = {
  all: ['credits'] as const,
  balance: () => [...creditKeys.all, 'balance'] as const,
  transactions: () => [...creditKeys.all, 'transactions'] as const,
  transactionList: (filters: CreditTransactionListParams) => 
    [...creditKeys.transactions(), filters] as const,
};

export const financialKeys = {
  summary: (params: FinancialSummaryParams) => ['financial', 'summary', params] as const,
};
```

### 4.2 Cache Invalidation Strategy

**Payment Actions** (cancel/refund):
1. Optimistic update: Update cache immediately
2. On success: Invalidate `paymentKeys.lists()` and `paymentKeys.detail(id)`
3. On error: Rollback optimistic update

**Credit Transactions**:
- Invalidate on payment completion (if credit is earned/spent)
- Refetch balance after transaction list updates

**Financial Summary**:
- Invalidate on any payment status change
- Invalidate on subscription changes

**Example Hook**:
```typescript
// src/features/sales/hooks/payments/useCancelPayment.ts
export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; reason?: string }) =>
      paymentsApi.cancelPayment(params.id, params.reason),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: paymentKeys.detail(id) });

      // Snapshot previous value
      const previousPayment = queryClient.getQueryData(paymentKeys.detail(id));

      // Optimistically update cache
      queryClient.setQueryData(paymentKeys.detail(id), (old: Payment) => ({
        ...old,
        status: 'cancelled' as const,
      }));

      return { previousPayment };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousPayment) {
        queryClient.setQueryData(paymentKeys.detail(id), context.previousPayment);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['financial', 'summary'] });
    },
  });
}
```

**Decision**: Follow this optimistic update pattern for all mutation hooks.

---

## 5. Component Architecture

### 5.1 Component Hierarchy

**Payment History Page**:
```
PaymentHistoryPage
├── PaymentFilters (status, date range)
├── PaymentList
│   └── PaymentCard × N
│       └── PaymentStatusBadge
└── Pagination
```

**Payment Details Page**:
```
PaymentDetailsPage
├── PaymentDetails (main info card)
├── PaymentActions (cancel/refund buttons)
└── RelatedSubscriptionCard (if applicable)
```

**Credit Transactions Page**:
```
CreditTransactionsPage
├── CreditBalanceCard (existing component)
├── TransactionTypeFilter
├── CreditTransactionList
│   └── TransactionCard × N
└── Pagination
```

**Financial Dashboard Page**:
```
FinancialDashboardPage
├── PeriodSelector (date range picker)
├── FinancialSummaryCard (metrics)
├── RecentPaymentsList (last 5)
└── RecentTransactionsList (last 5)
```

### 5.2 Component Reusability

**Existing Components to Reuse**:
- `Pagination` (`src/shared/components/Pagination.tsx`)
- `DataTable` (`src/shared/components/DataTable.tsx`)
- shadcn/ui components: `Card`, `Badge`, `Button`, `Select`, `DatePicker`

**New Reusable Components**:
- `PaymentStatusBadge`: Color-coded status indicator (green=completed, red=failed, yellow=pending, gray=cancelled/refunded)
- `CurrencyDisplay`: Format cents to BRL currency (`R$ 99,00`)
- `DateRangeFilter`: Combines two date pickers for start/end dates
- `EmptyState`: Generic empty state with icon and message

### 5.3 Form Handling

**Payment Actions** (cancel/refund):
- Use shadcn/ui `Dialog` for confirmation modal
- Optional `Textarea` for reason input
- `Button` with loading state during mutation

**Filters**:
- Use controlled inputs with React state
- Debounce filter changes (300ms) to avoid excessive API calls
- URL query params for persistence (e.g., `/payments?status=completed&page=2`)

**Decision**: Use React Router's `useSearchParams` for URL-based filter state.

---

## 6. Pagination Strategy

### 6.1 Server-Side Pagination

**Approach**: Backend returns paginated data with metadata.

**Benefits**:
- Reduces initial load time
- Handles large datasets efficiently
- Standard REST pagination pattern

**Implementation**:
```typescript
// src/features/sales/hooks/payments/usePayments.ts
export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.getPayments(params),
    placeholderData: keepPreviousData, // Keep old data while fetching new page
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

**Pagination Component**:
- Shows current page, total pages, and page size
- Previous/Next buttons
- Page number input (jump to page)
- Items per page selector (10, 25, 50)

### 6.2 Infinite Scroll (Alternative)

**Not Chosen** because:
- Spec explicitly mentions pagination (FR-001: 10 items per page)
- Traditional pagination is more appropriate for financial data (easier to reference specific transactions)
- Infinite scroll adds complexity without user benefit

---

## 7. Error Handling Patterns

### 7.1 API Error Display

**Current Pattern** (from CheckoutPage):
```typescript
const [errorMessage, setErrorMessage] = useState<string>();

// In mutation hook
onError: (error) => {
  if (error instanceof ApiClientError) {
    setErrorMessage(error.message);
  } else {
    setErrorMessage('Erro desconhecido');
  }
};

// In component
{errorMessage && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Erro</AlertTitle>
    <AlertDescription>{errorMessage}</AlertDescription>
  </Alert>
)}
```

**Decision**: Replicate this pattern for payment actions and other mutations.

### 7.2 Corrupted Data Handling

**Spec Requirement** (FR-019): Display corrupted payment data with warning indicator.

**Approach**:
```typescript
// Validate payment data with Zod
const safePayment = paymentSchema.safeParse(rawPayment);

if (!safePayment.success) {
  // Display with warning badge
  return <PaymentCard payment={rawPayment} isCorrupted={true} />;
}
```

**UI Indicator**:
- Yellow warning badge next to payment amount
- Tooltip: "Dados incompletos ou corrompidos"
- Disable action buttons for corrupted payments

---

## 8. Routing Strategy

### 8.1 New Routes

```typescript
// src/features/sales/routes.tsx
export const salesRoutes: RouteObject[] = [
  // Existing routes
  { path: '/pricing', element: <PricingPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/subscription', element: <SubscriptionManagementPage /> },

  // New routes
  { path: '/payments', element: <PaymentHistoryPage /> },
  { path: '/payments/:id', element: <PaymentDetailsPage /> },
  { path: '/credits/transactions', element: <CreditTransactionsPage /> },
  { path: '/financial', element: <FinancialDashboardPage /> },
];
```

### 8.2 Navigation Integration

**Add to Main Navigation** (sidebar or header):
- "Pagamentos" → `/payments`
- "Créditos" → `/credits/transactions`
- "Financeiro" → `/financial` (or integrate into dashboard)

**Breadcrumb Pattern**:
- Payment Details: Home > Pagamentos > [Payment ID]
- Credit Transactions: Home > Créditos > Transações

---

## 9. Testing Strategy

### 9.1 Contract Tests

**File**: `tests/contract/sales/payments.contract.test.ts`

**Purpose**: Validate API response structure matches TypeScript types.

```typescript
import { describe, it, expect } from 'vitest';
import { paymentSchema, paymentListResponseSchema } from '@/features/sales/schemas/payment.schema';
import { paymentsApi } from '@/features/sales/api/paymentsApi';

describe('Payments API Contracts', () => {
  it('should match payment list schema', async () => {
    const response = await paymentsApi.getPayments({ page: 1, limit: 10 });
    expect(() => paymentListResponseSchema.parse(response)).not.toThrow();
  });

  it('should match payment detail schema', async () => {
    const response = await paymentsApi.getPaymentById('test-id');
    expect(() => paymentSchema.parse(response)).not.toThrow();
  });
});
```

### 9.2 Integration Tests

**File**: `tests/integration/sales/payment-flow.test.tsx`

**Purpose**: Test user flows end-to-end.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentHistoryPage } from '@/features/sales/pages/PaymentHistoryPage';
import { setupMockServer } from '@/test/mocks/server';

describe('Payment History Flow', () => {
  it('should display payment list and filter by status', async () => {
    setupMockServer();
    const user = userEvent.setup();

    render(<PaymentHistoryPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/R\$ 99,00/)).toBeInTheDocument();
    });

    // Filter by completed
    await user.selectOptions(screen.getByLabelText('Status'), 'completed');

    // Verify filtered results
    await waitFor(() => {
      expect(screen.queryByText('Pendente')).not.toBeInTheDocument();
    });
  });
});
```

### 9.3 Unit Tests

**Hook Testing**:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { usePayments } from '@/features/sales/hooks/payments/usePayments';
import { createQueryClientWrapper } from '@/test/utils';

describe('usePayments', () => {
  it('should fetch payment list with filters', async () => {
    const { result } = renderHook(
      () => usePayments({ status: 'completed', page: 1 }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.payments).toHaveLength(10);
  });
});
```

**Component Testing**:
```typescript
import { render, screen } from '@testing-library/react';
import { PaymentCard } from '@/features/sales/components/payments/PaymentCard';

describe('PaymentCard', () => {
  it('should display payment information', () => {
    const payment = {
      id: '123',
      amount: 9900,
      status: 'completed',
      method: 'credit_card',
      description: 'Assinatura Premium',
      createdAt: '2025-01-08T10:00:00Z',
    };

    render(<PaymentCard payment={payment} />);

    expect(screen.getByText('R$ 99,00')).toBeInTheDocument();
    expect(screen.getByText('Assinatura Premium')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });
});
```

---

## 10. Performance Considerations

### 10.1 Query Optimization

**Caching Strategy**:
- Payment list: 5-minute stale time (data doesn't change frequently)
- Payment details: 10-minute stale time
- Credit balance: 1-minute stale time (more dynamic)
- Financial summary: 5-minute stale time

**Prefetching**:
```typescript
// Prefetch next page when user hovers over "Next" button
const prefetchNextPage = () => {
  queryClient.prefetchQuery({
    queryKey: paymentKeys.list({ ...params, page: params.page + 1 }),
    queryFn: () => paymentsApi.getPayments({ ...params, page: params.page + 1 }),
  });
};

<Button onMouseEnter={prefetchNextPage}>Próxima</Button>
```

### 10.2 Bundle Size

**Lazy Loading**:
```typescript
// Lazy load financial dashboard (less frequently accessed)
const FinancialDashboardPage = lazy(() => 
  import('@/features/sales/pages/FinancialDashboardPage')
);
```

**Tree Shaking**:
- Import only needed shadcn/ui components
- Avoid importing entire libraries (e.g., `import { format } from 'date-fns/format'` instead of `import { format } from 'date-fns'`)

---

## 11. Accessibility (a11y)

### 11.1 Semantic HTML

- Use `<table>` for payment list (if using DataTable)
- Use `<nav>` for pagination
- Use `<button>` for actions (not `<div onClick>`)
- Use `<label>` for form inputs

### 11.2 ARIA Attributes

**Payment Status Badge**:
```tsx
<Badge aria-label={`Status: ${status}`}>
  {statusLabel}
</Badge>
```

**Filter Inputs**:
```tsx
<Select aria-label="Filtrar por status">
  <SelectTrigger>
    <SelectValue placeholder="Status" />
  </SelectTrigger>
</Select>
```

### 11.3 Keyboard Navigation

- All interactive elements reachable via Tab
- Enter/Space to trigger buttons
- Escape to close modals
- Arrow keys for pagination (optional enhancement)

---

## 12. Implementation Risks

### 12.1 Backend Dependency

**Risk**: Backend APIs (`/api/payments`, `/api/credits/transactions`) may not be fully implemented.

**Mitigation**:
1. Document API contracts in `contracts/` folder
2. Share contracts with backend team early
3. Use MSW (Mock Service Worker) for local development
4. Implement contract tests to catch breaking changes

### 12.2 Real-Time Updates

**Risk**: Payment status changes (e.g., pending → completed) may not reflect immediately.

**Mitigation**:
- Use TanStack Query's background refetching (default: every 5 minutes)
- Add manual "Refresh" button
- Consider WebSocket integration for critical updates (Phase 2 enhancement)

### 12.3 Date Range Filtering

**Risk**: Large date ranges may cause performance issues.

**Mitigation**:
- Add default date range (e.g., last 30 days)
- Backend should enforce maximum date range (e.g., 1 year)
- Show loading indicator during long queries

---

## 13. Open Questions for Backend Team

1. **Payment Actions Authorization**:
   - Who can cancel/refund payments? (Admin only, or any authenticated user?)
   - Are there time limits for cancellation/refund? (e.g., within 24 hours)

2. **Pagination Limits**:
   - What's the maximum `limit` value allowed? (e.g., max 100 items per page)

3. **Filter Combinations**:
   - Can we combine status + date range filters?
   - Are there performance implications for complex queries?

4. **Real-Time Updates**:
   - Is there a WebSocket endpoint for payment status updates?
   - Or should we rely on polling?

5. **Credit Transaction Details**:
   - Does `relatedEntityId` always exist for transactions?
   - Can we fetch related entity details (e.g., payment, subscription) via this ID?

6. **Financial Summary Calculation**:
   - Is `totalSpent` calculated server-side or should we sum client-side?
   - Does it include refunded/cancelled payments?

---

## 14. Next Steps

### Phase 1: Core Implementation
1. ✅ Create TypeScript interfaces and Zod schemas
2. ✅ Implement API layer (`paymentsApi.ts`, extend `creditsApi.ts`)
3. ✅ Build React Query hooks (queries + mutations)
4. ✅ Create core components (PaymentCard, PaymentList, Filters)
5. ✅ Implement pages (PaymentHistoryPage, PaymentDetailsPage)
6. ✅ Add routes and navigation links

### Phase 2: Testing & Polish
1. ✅ Write contract tests
2. ✅ Write integration tests
3. ✅ Write unit tests
4. ✅ Accessibility audit
5. ✅ Performance optimization
6. ✅ Error handling edge cases

### Phase 3: Advanced Features (Optional)
1. Export to CSV/PDF
2. Real-time payment status updates (WebSockets)
3. Advanced filtering (multiple statuses, payment methods)
4. Payment receipt download

---

## 15. References

- TanStack Query v5 Documentation: https://tanstack.com/query/latest
- Zod Documentation: https://zod.dev
- shadcn/ui Components: https://ui.shadcn.com
- React Router v6: https://reactrouter.com
- Axios Documentation: https://axios-http.com

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Next Artifact**: `data-model.md`
