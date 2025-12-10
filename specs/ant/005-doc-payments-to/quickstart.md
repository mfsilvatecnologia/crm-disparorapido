# Quickstart Guide - Payments, Subscriptions, and Credits Management

**Feature**: Payments, Subscriptions, and Credits Management  
**Spec**: `specs/005-doc-payments-to/spec.md`  
**Date**: 2025-01-08

---

## Overview

This quickstart guide helps developers implement the payments, subscriptions, and credits management feature in the LeadsRapido frontend. Follow these steps to set up the necessary infrastructure and start building.

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Backend API endpoints available (`/api/payments`, `/api/credits/transactions`, `/api/financial/summary`)
- ✅ Authentication token mechanism in place
- ✅ Existing `sales` feature structure in place

---

## Phase 1: Setup and Configuration (15 minutes)

### Step 1: Install Dependencies (if needed)

All required dependencies should already be installed. Verify:

```bash
# Check package.json for these dependencies
# - @tanstack/react-query@^5.x
# - zod@^3.x
# - axios@^1.x
# - react-router-dom@^6.x
# - shadcn/ui components

# If any are missing, install them
npm install
```

### Step 2: Create Type Definitions

Create the base type files:

```bash
# Create type files
touch src/features/sales/types/payment.types.ts
touch src/features/sales/types/financial.types.ts
touch src/features/sales/types/filters.types.ts
touch src/features/sales/types/components.types.ts
touch src/features/sales/types/guards.ts
touch src/features/sales/types/index.ts
```

**Copy type definitions from `data-model.md`** into these files.

### Step 3: Create Zod Schemas

Create schema files:

```bash
# Create schema files
touch src/features/sales/schemas/payment.schema.ts
touch src/features/sales/schemas/financial.schema.ts
touch src/features/sales/schemas/index.ts
```

**Copy schema definitions from `data-model.md`** into these files.

### Step 4: Verify API Client

The existing `src/lib/api-client.ts` should already have:
- ✅ Axios instance with base URL
- ✅ Request interceptor (adds Authorization header)
- ✅ Response interceptor (error handling)
- ✅ `getErrorMessage()` helper (extracts error messages)

No changes needed!

---

## Phase 2: API Layer Implementation (30 minutes)

### Step 1: Create Payments API

Create file: `src/features/sales/api/paymentsApi.ts`

```typescript
import { apiClient } from '@/lib/api-client';
import { 
  Payment, 
  PaymentListParams, 
  PaymentListResponse,
  PaymentActionResponse,
} from '../types';
import { 
  paymentSchema, 
  paymentListResponseSchema,
  paymentActionResponseSchema,
} from '../schemas';

/**
 * Fetch paginated payment list with filters
 */
export async function getPayments(params: PaymentListParams): Promise<PaymentListResponse> {
  const response = await apiClient.get<PaymentListResponse>('/payments', { params });
  return paymentListResponseSchema.parse(response.data);
}

/**
 * Fetch single payment by ID
 */
export async function getPaymentById(id: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`/payments/${id}`);
  return paymentSchema.parse(response.data);
}

/**
 * Cancel a pending payment
 */
export async function cancelPayment(id: string, reason?: string): Promise<PaymentActionResponse> {
  const response = await apiClient.post<PaymentActionResponse>(`/payments/${id}/cancel`, { reason });
  return paymentActionResponseSchema.parse(response.data);
}

/**
 * Refund a completed payment
 */
export async function refundPayment(id: string, reason?: string): Promise<PaymentActionResponse> {
  const response = await apiClient.post<PaymentActionResponse>(`/payments/${id}/refund`, { reason });
  return paymentActionResponseSchema.parse(response.data);
}

export const paymentsApi = {
  getPayments,
  getPaymentById,
  cancelPayment,
  refundPayment,
};
```

### Step 2: Extend Credits API

Update `src/features/sales/api/creditsApi.ts` (add transaction list):

```typescript
import { apiClient } from '@/lib/api-client';
import { 
  CreditTransactionListParams,
  CreditTransactionListResponse,
} from '../types';
import { creditTransactionListResponseSchema } from '../schemas';

/**
 * Fetch paginated credit transaction list with filters
 */
export async function getCreditTransactions(
  params: CreditTransactionListParams
): Promise<CreditTransactionListResponse> {
  const response = await apiClient.get<CreditTransactionListResponse>('/credits/transactions', { params });
  return creditTransactionListResponseSchema.parse(response.data);
}

// ... keep existing getCreditBalance function

export const creditsApi = {
  getCreditBalance,      // existing
  getCreditTransactions, // new
};
```

### Step 3: Create Financial API

Create file: `src/features/sales/api/financialApi.ts`

```typescript
import { apiClient } from '@/lib/api-client';
import { FinancialSummary, FinancialSummaryParams } from '../types';
import { financialSummarySchema } from '../schemas';

/**
 * Fetch financial summary for a time period
 */
export async function getFinancialSummary(
  params: FinancialSummaryParams
): Promise<FinancialSummary> {
  const response = await apiClient.get<FinancialSummary>('/financial/summary', { params });
  return financialSummarySchema.parse(response.data);
}

export const financialApi = {
  getFinancialSummary,
};
```

---

## Phase 3: React Query Hooks (45 minutes)

### Step 1: Create Query Keys

Create file: `src/features/sales/hooks/queryKeys.ts`

```typescript
import { 
  PaymentListParams, 
  CreditTransactionListParams,
  FinancialSummaryParams,
} from '../types';

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

### Step 2: Create Payment Hooks

Create file: `src/features/sales/hooks/payments/usePayments.ts`

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { paymentKeys } from '../queryKeys';
import { PaymentListParams } from '../../types';

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsApi.getPayments(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

Create file: `src/features/sales/hooks/payments/usePaymentDetails.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { paymentKeys } from '../queryKeys';

export function usePaymentDetails(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsApi.getPaymentById(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
```

### Step 3: Create Payment Action Hooks

Create file: `src/features/sales/hooks/payments/useCancelPayment.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { paymentKeys, financialKeys } from '../queryKeys';
import { Payment } from '../../types';

export function useCancelPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentsApi.cancelPayment(id, reason),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: paymentKeys.detail(id) });
      const previousPayment = queryClient.getQueryData(paymentKeys.detail(id));

      queryClient.setQueryData(paymentKeys.detail(id), (old: Payment) => ({
        ...old,
        status: 'cancelled' as const,
      }));

      return { previousPayment };
    },
    onError: (err, { id }, context) => {
      if (context?.previousPayment) {
        queryClient.setQueryData(paymentKeys.detail(id), context.previousPayment);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['financial', 'summary'] });
    },
  });
}
```

**Repeat similar pattern for `useRefundPayment.ts`**.

### Step 4: Create Credit Transaction Hook

Create file: `src/features/sales/hooks/credits/useCreditTransactions.ts`

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { creditsApi } from '../../api/creditsApi';
import { creditKeys } from '../queryKeys';
import { CreditTransactionListParams } from '../../types';

export function useCreditTransactions(params: CreditTransactionListParams) {
  return useQuery({
    queryKey: creditKeys.transactionList(params),
    queryFn: () => creditsApi.getCreditTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Step 5: Create Financial Summary Hook

Create file: `src/features/sales/hooks/financial/useFinancialSummary.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { financialApi } from '../../api/financialApi';
import { financialKeys } from '../queryKeys';
import { FinancialSummaryParams } from '../../types';

export function useFinancialSummary(params: FinancialSummaryParams) {
  return useQuery({
    queryKey: financialKeys.summary(params),
    queryFn: () => financialApi.getFinancialSummary(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

## Phase 4: Core Components (60 minutes)

### Step 1: Payment Status Badge

Create file: `src/features/sales/components/payments/PaymentStatusBadge.tsx`

```tsx
import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '../../types';

const statusConfig: Record<PaymentStatus, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'outline' },
  completed: { label: 'Concluído', variant: 'default' },
  failed: { label: 'Falhou', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'secondary' },
  refunded: { label: 'Reembolsado', variant: 'secondary' },
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

### Step 2: Payment Card

Create file: `src/features/sales/components/payments/PaymentCard.tsx`

```tsx
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Payment } from '../../types';
import { PaymentStatusBadge } from './PaymentStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function PaymentCard({ payment, onClick }: { payment: Payment; onClick?: () => void }) {
  return (
    <Card className="cursor-pointer hover:bg-accent" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{formatCurrency(payment.amount)}</CardTitle>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <CardDescription>
          {payment.description} • {formatDate(payment.createdAt)}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### Step 3: Payment List

Create file: `src/features/sales/components/payments/PaymentList.tsx`

```tsx
import { usePayments } from '../../hooks/payments/usePayments';
import { PaymentCard } from './PaymentCard';
import { useNavigate } from 'react-router-dom';
import { PaymentListParams } from '../../types';

export function PaymentList({ filters }: { filters: PaymentListParams }) {
  const { data, isLoading, error } = usePayments(filters);
  const navigate = useNavigate();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar pagamentos</div>;
  if (!data || data.payments.length === 0) return <div>Nenhum pagamento encontrado</div>;

  return (
    <div className="space-y-4">
      {data.payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          onClick={() => navigate(`/payments/${payment.id}`)}
        />
      ))}
    </div>
  );
}
```

### Step 4: Payment Filters

Create file: `src/features/sales/components/payments/PaymentFilters.tsx`

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentStatus } from '../../types';

interface PaymentFiltersProps {
  status?: PaymentStatus;
  onStatusChange: (status?: PaymentStatus) => void;
}

export function PaymentFilters({ status, onStatusChange }: PaymentFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select value={status} onValueChange={(v) => onStatusChange(v as PaymentStatus)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendente</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="failed">Falhou</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
          <SelectItem value="refunded">Reembolsado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

## Phase 5: Pages (60 minutes)

### Step 1: Payment History Page

Create file: `src/features/sales/pages/PaymentHistoryPage.tsx`

```tsx
import { useState } from 'react';
import { PaymentList } from '../components/payments/PaymentList';
import { PaymentFilters } from '../components/payments/PaymentFilters';
import { Pagination } from '@/shared/components/Pagination';
import { PaymentListParams, PaymentStatus } from '../types';

export function PaymentHistoryPage() {
  const [filters, setFilters] = useState<PaymentListParams>({ page: 1, limit: 10 });

  const handleStatusChange = (status?: PaymentStatus) => {
    setFilters({ ...filters, status, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Histórico de Pagamentos</h1>
      <PaymentFilters status={filters.status} onStatusChange={handleStatusChange} />
      <PaymentList filters={filters} />
      <Pagination
        currentPage={filters.page || 1}
        totalPages={10} // Get from API response
        onPageChange={handlePageChange}
      />
    </div>
  );
}
```

### Step 2: Payment Details Page

Create file: `src/features/sales/pages/PaymentDetailsPage.tsx`

```tsx
import { useParams } from 'react-router-dom';
import { usePaymentDetails } from '../hooks/payments/usePaymentDetails';
import { PaymentStatusBadge } from '../components/payments/PaymentStatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: payment, isLoading, error } = usePaymentDetails(id!);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar pagamento</div>;
  if (!payment) return <div>Pagamento não encontrado</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalhes do Pagamento</h1>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatCurrency(payment.amount)}</span>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <p>{payment.description}</p>
        <p>Data: {formatDate(payment.createdAt)}</p>
        <p>Método: {payment.method}</p>
      </div>
    </div>
  );
}
```

---

## Phase 6: Routing (15 minutes)

### Update Routes

Add new routes to `src/features/sales/routes.tsx`:

```typescript
export const salesRoutes: RouteObject[] = [
  // ... existing routes
  { path: '/payments', element: <PaymentHistoryPage /> },
  { path: '/payments/:id', element: <PaymentDetailsPage /> },
  { path: '/credits/transactions', element: <CreditTransactionsPage /> },
  { path: '/financial', element: <FinancialDashboardPage /> },
];
```

---

## Phase 7: Testing (60 minutes)

### Contract Test Example

Create file: `tests/contract/sales/payments.contract.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { paymentListResponseSchema } from '@/features/sales/schemas';
import { paymentsApi } from '@/features/sales/api/paymentsApi';

describe('Payments API Contracts', () => {
  it('should match payment list schema', async () => {
    const response = await paymentsApi.getPayments({ page: 1, limit: 10 });
    expect(() => paymentListResponseSchema.parse(response)).not.toThrow();
  });
});
```

---

## Checklist

### Phase 1: Setup
- [ ] Verify dependencies installed
- [ ] Create type definition files
- [ ] Create Zod schema files
- [ ] Verify API client configuration

### Phase 2: API Layer
- [ ] Implement `paymentsApi.ts`
- [ ] Extend `creditsApi.ts`
- [ ] Implement `financialApi.ts`

### Phase 3: React Query Hooks
- [ ] Create query keys
- [ ] Implement `usePayments` hook
- [ ] Implement `usePaymentDetails` hook
- [ ] Implement `useCancelPayment` hook
- [ ] Implement `useRefundPayment` hook
- [ ] Implement `useCreditTransactions` hook
- [ ] Implement `useFinancialSummary` hook

### Phase 4: Components
- [ ] Implement `PaymentStatusBadge`
- [ ] Implement `PaymentCard`
- [ ] Implement `PaymentList`
- [ ] Implement `PaymentFilters`
- [ ] Implement `PaymentActions`

### Phase 5: Pages
- [ ] Implement `PaymentHistoryPage`
- [ ] Implement `PaymentDetailsPage`
- [ ] Implement `CreditTransactionsPage`
- [ ] Implement `FinancialDashboardPage`

### Phase 6: Routing
- [ ] Add payment routes
- [ ] Add credit transaction routes
- [ ] Add financial dashboard routes
- [ ] Update navigation links

### Phase 7: Testing
- [ ] Write contract tests
- [ ] Write integration tests
- [ ] Write unit tests
- [ ] Test error scenarios

---

## Troubleshooting

### API Errors

**Problem**: Getting 401 Unauthorized errors.

**Solution**: Verify auth token is being added by API client interceptor.

### Type Errors

**Problem**: TypeScript errors with Zod schemas.

**Solution**: Ensure schemas match TypeScript interfaces exactly.

### Query Caching Issues

**Problem**: Stale data showing after mutations.

**Solution**: Verify invalidateQueries is called in mutation hooks.

---

## Next Steps

After completing this quickstart:

1. ✅ Implement advanced filtering (date ranges, multiple statuses)
2. ✅ Add error boundary for pages
3. ✅ Implement loading skeletons
4. ✅ Add accessibility attributes
5. ✅ Optimize bundle size (lazy loading)

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Estimated Completion Time**: 4-5 hours
