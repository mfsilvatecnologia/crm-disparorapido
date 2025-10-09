# Data Model - Payments, Subscriptions, and Credits Management

**Feature**: Payments, Subscriptions, and Credits Management  
**Spec**: `specs/005-doc-payments-to/spec.md`  
**Date**: 2025-01-08

---

## Overview

This document defines the TypeScript interfaces, Zod validation schemas, and data structures for the payments, subscriptions, and credits management feature. All types are designed for a React + TypeScript frontend consuming REST APIs.

---

## 1. Core Domain Types

### 1.1 Payment Types

**File**: `src/features/sales/types/payment.types.ts`

```typescript
/**
 * Payment Status
 * - pending: Payment initiated but not yet processed
 * - completed: Payment successfully processed
 * - failed: Payment processing failed
 * - cancelled: Payment manually cancelled before completion
 * - refunded: Completed payment that was refunded
 */
export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

/**
 * Payment Method
 * - credit_card: Credit or debit card payment
 * - pix: Brazilian instant payment system
 * - boleto: Brazilian bank slip payment
 */
export type PaymentMethod = 
  | 'credit_card' 
  | 'pix' 
  | 'boleto';

/**
 * Payment Entity
 * Represents a single payment transaction
 */
export interface Payment {
  id: string;
  amount: number;                    // Amount in cents (e.g., 9900 = R$ 99,00)
  status: PaymentStatus;
  method: PaymentMethod;
  createdAt: string;                 // ISO 8601 datetime
  updatedAt: string;                 // ISO 8601 datetime
  description: string;               // Human-readable description
  subscriptionId?: string;           // Related subscription (if applicable)
  metadata?: Record<string, unknown>; // Additional custom data
}

/**
 * Payment List Query Parameters
 * Used for filtering and pagination
 */
export interface PaymentListParams {
  page?: number;                     // Page number (1-indexed)
  limit?: number;                    // Items per page (default: 10)
  status?: PaymentStatus;            // Filter by payment status
  startDate?: string;                // Filter by date range start (ISO 8601)
  endDate?: string;                  // Filter by date range end (ISO 8601)
}

/**
 * Pagination Metadata
 * Standard pagination response structure
 */
export interface PaginationMeta {
  currentPage: number;               // Current page number
  totalPages: number;                // Total number of pages
  totalItems: number;                // Total number of items
  itemsPerPage: number;              // Items per page
}

/**
 * Payment List Response
 * Backend API response for GET /api/payments
 */
export interface PaymentListResponse {
  payments: Payment[];
  pagination: PaginationMeta;
}

/**
 * Payment Action Parameters
 * Used for cancel/refund operations
 */
export interface PaymentActionParams {
  reason?: string;                   // Optional reason for action
}

/**
 * Payment Action Response
 * Backend API response for POST /api/payments/:id/cancel or /refund
 */
export interface PaymentActionResponse {
  success: boolean;
  payment: Payment;                  // Updated payment object
  message?: string;                  // Optional success/error message
}

/**
 * Payment Details Response
 * Backend API response for GET /api/payments/:id
 */
export interface PaymentDetailsResponse extends Payment {
  // Additional fields for detailed view (if any)
  transactionId?: string;            // External transaction ID (e.g., from payment gateway)
  receiptUrl?: string;               // URL to payment receipt
}
```

### 1.2 Credit Types

**File**: `src/features/sales/types/credit.types.ts`

```typescript
/**
 * Credit Transaction Type
 * - earned: Credits earned (e.g., from campaign completion)
 * - spent: Credits spent (e.g., for lead enrichment)
 * - bonus: Bonus credits (e.g., promotional credits)
 * - refund: Credits refunded (e.g., from cancelled payment)
 */
export type CreditTransactionType = 
  | 'earned' 
  | 'spent' 
  | 'bonus' 
  | 'refund';

/**
 * Related Entity Type
 * - payment: Transaction related to a payment
 * - subscription: Transaction related to a subscription
 * - campaign: Transaction related to a campaign
 */
export type RelatedEntityType = 
  | 'payment' 
  | 'subscription' 
  | 'campaign';

/**
 * Credit Transaction Entity
 * Represents a single credit transaction
 */
export interface CreditTransaction {
  id: string;
  amount: number;                    // Credit amount (positive for earned, negative for spent)
  type: CreditTransactionType;
  description: string;               // Human-readable description
  createdAt: string;                 // ISO 8601 datetime
  relatedEntityType?: RelatedEntityType; // Type of related entity
  relatedEntityId?: string;          // ID of related entity
  balanceAfter: number;              // Credit balance after this transaction
}

/**
 * Credit Transaction List Query Parameters
 * Used for filtering and pagination
 */
export interface CreditTransactionListParams {
  page?: number;                     // Page number (1-indexed)
  limit?: number;                    // Items per page (default: 10)
  type?: CreditTransactionType;      // Filter by transaction type
}

/**
 * Credit Transaction List Response
 * Backend API response for GET /api/credits/transactions
 */
export interface CreditTransactionListResponse {
  transactions: CreditTransaction[];
  pagination: PaginationMeta;
}

/**
 * Credit Balance
 * Current credit balance for the user/company
 */
export interface CreditBalance {
  balance: number;                   // Current credit balance
  lastUpdated: string;               // ISO 8601 datetime of last update
}
```

### 1.3 Financial Summary Types

**File**: `src/features/sales/types/financial.types.ts`

```typescript
/**
 * Financial Summary Query Parameters
 * Used for date range filtering
 */
export interface FinancialSummaryParams {
  startDate?: string;                // ISO 8601 date (default: 30 days ago)
  endDate?: string;                  // ISO 8601 date (default: today)
}

/**
 * Financial Summary
 * Aggregated financial metrics for a time period
 */
export interface FinancialSummary {
  totalSpent: number;                // Total amount spent in cents
  totalEarned: number;               // Total credits earned
  activeSubscriptions: number;       // Number of active subscriptions
  pendingPayments: number;           // Number of pending payments
  period: {
    startDate: string;               // ISO 8601 date
    endDate: string;                 // ISO 8601 date
  };
}
```

### 1.4 Subscription Types (Extended)

**File**: `src/features/sales/types/subscription.types.ts`

```typescript
/**
 * Subscription Status
 */
export type SubscriptionStatus = 
  | 'trial' 
  | 'active' 
  | 'cancelled' 
  | 'expired';

/**
 * Subscription Entity
 * Represents a user/company subscription
 */
export interface Subscription {
  id: string;
  productId: string;
  status: SubscriptionStatus;
  startDate: string;                 // ISO 8601 datetime
  endDate?: string;                  // ISO 8601 datetime (if applicable)
  autoRenew: boolean;
  creditsIncluded: number;           // Monthly credit allowance
  creditsUsed: number;               // Credits used in current period
  nextBillingDate?: string;          // ISO 8601 datetime
}

/**
 * Product Entity
 * Represents a subscription product/plan
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;                     // Price in cents
  creditsIncluded: number;           // Monthly credits
  features: string[];                // List of features
  billingCycle: 'monthly' | 'yearly';
}
```

---

## 2. Zod Validation Schemas

### 2.1 Payment Schemas

**File**: `src/features/sales/schemas/payment.schema.ts`

```typescript
import { z } from 'zod';

/**
 * Payment Status Enum Schema
 */
export const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

/**
 * Payment Method Enum Schema
 */
export const paymentMethodSchema = z.enum([
  'credit_card',
  'pix',
  'boleto',
]);

/**
 * Payment Entity Schema
 */
export const paymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  status: paymentStatusSchema,
  method: paymentMethodSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string().min(1),
  subscriptionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Payment List Parameters Schema
 */
export const paymentListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: paymentStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Pagination Metadata Schema
 */
export const paginationMetaSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  itemsPerPage: z.number().int().positive(),
});

/**
 * Payment List Response Schema
 */
export const paymentListResponseSchema = z.object({
  payments: z.array(paymentSchema),
  pagination: paginationMetaSchema,
});

/**
 * Payment Action Parameters Schema
 */
export const paymentActionParamsSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Payment Action Response Schema
 */
export const paymentActionResponseSchema = z.object({
  success: z.boolean(),
  payment: paymentSchema,
  message: z.string().optional(),
});

/**
 * Payment Details Response Schema
 */
export const paymentDetailsResponseSchema = paymentSchema.extend({
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
});
```

### 2.2 Credit Schemas

**File**: `src/features/sales/schemas/credit.schema.ts`

```typescript
import { z } from 'zod';
import { paginationMetaSchema } from './payment.schema';

/**
 * Credit Transaction Type Enum Schema
 */
export const creditTransactionTypeSchema = z.enum([
  'earned',
  'spent',
  'bonus',
  'refund',
]);

/**
 * Related Entity Type Enum Schema
 */
export const relatedEntityTypeSchema = z.enum([
  'payment',
  'subscription',
  'campaign',
]);

/**
 * Credit Transaction Entity Schema
 */
export const creditTransactionSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int(), // Can be negative for spent credits
  type: creditTransactionTypeSchema,
  description: z.string().min(1),
  createdAt: z.string().datetime(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
  relatedEntityId: z.string().optional(),
  balanceAfter: z.number().int().nonnegative(),
});

/**
 * Credit Transaction List Parameters Schema
 */
export const creditTransactionListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  type: creditTransactionTypeSchema.optional(),
});

/**
 * Credit Transaction List Response Schema
 */
export const creditTransactionListResponseSchema = z.object({
  transactions: z.array(creditTransactionSchema),
  pagination: paginationMetaSchema,
});

/**
 * Credit Balance Schema
 */
export const creditBalanceSchema = z.object({
  balance: z.number().int().nonnegative(),
  lastUpdated: z.string().datetime(),
});
```

### 2.3 Financial Summary Schemas

**File**: `src/features/sales/schemas/financial.schema.ts`

```typescript
import { z } from 'zod';

/**
 * Financial Summary Parameters Schema
 */
export const financialSummaryParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Financial Summary Schema
 */
export const financialSummarySchema = z.object({
  totalSpent: z.number().int().nonnegative(),
  totalEarned: z.number().int().nonnegative(),
  activeSubscriptions: z.number().int().nonnegative(),
  pendingPayments: z.number().int().nonnegative(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});
```

---

## 3. UI-Specific Types

### 3.1 Filter State Types

**File**: `src/features/sales/types/filters.types.ts`

```typescript
import { PaymentStatus, CreditTransactionType } from './payment.types';

/**
 * Payment Filter State
 * Client-side filter state for payment list
 */
export interface PaymentFilters {
  status?: PaymentStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  page: number;
  limit: number;
}

/**
 * Credit Transaction Filter State
 * Client-side filter state for credit transaction list
 */
export interface CreditTransactionFilters {
  type?: CreditTransactionType;
  page: number;
  limit: number;
}

/**
 * Financial Summary Filter State
 * Client-side filter state for financial summary
 */
export interface FinancialSummaryFilters {
  startDate: Date;
  endDate: Date;
}
```

### 3.2 Component Props Types

**File**: `src/features/sales/types/components.types.ts`

```typescript
import { Payment, CreditTransaction, FinancialSummary } from './payment.types';

/**
 * Payment Card Props
 */
export interface PaymentCardProps {
  payment: Payment;
  isCorrupted?: boolean;             // Display warning for corrupted data
  onClick?: () => void;              // Navigate to details page
}

/**
 * Payment Status Badge Props
 */
export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  showLabel?: boolean;               // Show status label text
}

/**
 * Payment Actions Props
 */
export interface PaymentActionsProps {
  payment: Payment;
  onCancel?: (reason?: string) => void;
  onRefund?: (reason?: string) => void;
  isCancelling?: boolean;
  isRefunding?: boolean;
}

/**
 * Credit Transaction Card Props
 */
export interface CreditTransactionCardProps {
  transaction: CreditTransaction;
  onRelatedEntityClick?: (type: RelatedEntityType, id: string) => void;
}

/**
 * Financial Summary Card Props
 */
export interface FinancialSummaryCardProps {
  summary: FinancialSummary;
  isLoading?: boolean;
}

/**
 * Pagination Props
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange?: (limit: number) => void;
}
```

---

## 4. API Response Types

### 4.1 Error Response Types

**File**: `src/lib/api-client.types.ts`

```typescript
/**
 * API Error Response
 * Standard error response structure from backend
 */
export interface ApiErrorResponse {
  error: string | {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * API Client Error
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
```

---

## 5. Query Key Types

### 5.1 TanStack Query Keys

**File**: `src/features/sales/hooks/payments/queryKeys.ts`

```typescript
import { PaymentListParams, CreditTransactionListParams, FinancialSummaryParams } from '../../types';

/**
 * Payment Query Keys
 * Type-safe query keys for TanStack Query
 */
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: PaymentListParams) => [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

/**
 * Credit Query Keys
 */
export const creditKeys = {
  all: ['credits'] as const,
  balance: () => [...creditKeys.all, 'balance'] as const,
  transactions: () => [...creditKeys.all, 'transactions'] as const,
  transactionList: (filters: CreditTransactionListParams) => 
    [...creditKeys.transactions(), filters] as const,
};

/**
 * Financial Query Keys
 */
export const financialKeys = {
  summary: (params: FinancialSummaryParams) => ['financial', 'summary', params] as const,
};
```

---

## 6. Utility Types

### 6.1 Formatter Types

**File**: `src/features/sales/utils/formatters.ts`

```typescript
/**
 * Currency Formatter Options
 */
export interface CurrencyFormatOptions {
  locale?: string;                   // Default: 'pt-BR'
  currency?: string;                 // Default: 'BRL'
  showSymbol?: boolean;              // Default: true
}

/**
 * Date Formatter Options
 */
export interface DateFormatOptions {
  locale?: string;                   // Default: 'pt-BR'
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;             // Default: false
}
```

---

## 7. Type Guards

### 7.1 Runtime Type Checks

**File**: `src/features/sales/types/guards.ts`

```typescript
import { Payment, CreditTransaction } from './payment.types';
import { paymentSchema, creditTransactionSchema } from '../schemas';

/**
 * Type guard for Payment
 */
export function isPayment(value: unknown): value is Payment {
  return paymentSchema.safeParse(value).success;
}

/**
 * Type guard for CreditTransaction
 */
export function isCreditTransaction(value: unknown): value is CreditTransaction {
  return creditTransactionSchema.safeParse(value).success;
}

/**
 * Check if payment data is corrupted
 */
export function isCorruptedPayment(payment: unknown): boolean {
  const result = paymentSchema.safeParse(payment);
  return !result.success;
}
```

---

## 8. State Management Types

### 8.1 React Query Hook Types

**File**: `src/features/sales/hooks/payments/types.ts`

```typescript
import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { 
  Payment, 
  PaymentListResponse, 
  PaymentActionResponse,
  PaymentListParams,
  PaymentActionParams,
} from '../../types';

/**
 * Use Payments Query Result
 */
export type UsePaymentsResult = UseQueryResult<PaymentListResponse, Error>;

/**
 * Use Payment Details Query Result
 */
export type UsePaymentDetailsResult = UseQueryResult<Payment, Error>;

/**
 * Use Cancel Payment Mutation Result
 */
export type UseCancelPaymentResult = UseMutationResult<
  PaymentActionResponse,
  Error,
  { id: string; reason?: string },
  unknown
>;

/**
 * Use Refund Payment Mutation Result
 */
export type UseRefundPaymentResult = UseMutationResult<
  PaymentActionResponse,
  Error,
  { id: string; reason?: string },
  unknown
>;
```

---

## 9. Test Data Types

### 9.1 Mock Data Types

**File**: `tests/mocks/sales/types.ts`

```typescript
import { Payment, CreditTransaction, FinancialSummary } from '@/features/sales/types';

/**
 * Payment Factory Options
 */
export interface PaymentFactoryOptions {
  status?: PaymentStatus;
  amount?: number;
  method?: PaymentMethod;
  description?: string;
}

/**
 * Credit Transaction Factory Options
 */
export interface CreditTransactionFactoryOptions {
  type?: CreditTransactionType;
  amount?: number;
  description?: string;
}

/**
 * Mock API Response Options
 */
export interface MockApiOptions {
  delay?: number;                    // Simulated network delay (ms)
  shouldFail?: boolean;              // Simulate API error
  errorStatus?: number;              // Error status code
  errorMessage?: string;             // Error message
}
```

---

## 10. Data Flow Diagram

```
┌─────────────────┐
│   React Query   │
│  (TanStack v5)  │
└────────┬────────┘
         │
         │ useQuery/useMutation
         │
┌────────▼────────┐
│   API Layer     │
│  (paymentsApi)  │
└────────┬────────┘
         │
         │ axios.get/post
         │
┌────────▼────────┐
│   API Client    │
│ (api-client.ts) │
└────────┬────────┘
         │
         │ HTTP Request + Auth Header
         │
┌────────▼────────┐
│  Backend API    │
│  REST Endpoints │
└─────────────────┘
         │
         │ JSON Response
         │
┌────────▼────────┐
│ Zod Validation  │
│   (schemas)     │
└────────┬────────┘
         │
         │ Validated Data
         │
┌────────▼────────┐
│   Components    │
│  (React + TS)   │
└─────────────────┘
```

---

## 11. Type Export Index

**File**: `src/features/sales/types/index.ts`

```typescript
// Payment types
export type {
  PaymentStatus,
  PaymentMethod,
  Payment,
  PaymentListParams,
  PaginationMeta,
  PaymentListResponse,
  PaymentActionParams,
  PaymentActionResponse,
  PaymentDetailsResponse,
} from './payment.types';

// Credit types
export type {
  CreditTransactionType,
  RelatedEntityType,
  CreditTransaction,
  CreditTransactionListParams,
  CreditTransactionListResponse,
  CreditBalance,
} from './credit.types';

// Financial types
export type {
  FinancialSummaryParams,
  FinancialSummary,
} from './financial.types';

// Subscription types
export type {
  SubscriptionStatus,
  Subscription,
  Product,
} from './subscription.types';

// Filter types
export type {
  PaymentFilters,
  CreditTransactionFilters,
  FinancialSummaryFilters,
} from './filters.types';

// Component props types
export type {
  PaymentCardProps,
  PaymentStatusBadgeProps,
  PaymentActionsProps,
  CreditTransactionCardProps,
  FinancialSummaryCardProps,
  PaginationProps,
} from './components.types';

// Type guards
export {
  isPayment,
  isCreditTransaction,
  isCorruptedPayment,
} from './guards';
```

---

## 12. Schema Export Index

**File**: `src/features/sales/schemas/index.ts`

```typescript
// Payment schemas
export {
  paymentStatusSchema,
  paymentMethodSchema,
  paymentSchema,
  paymentListParamsSchema,
  paginationMetaSchema,
  paymentListResponseSchema,
  paymentActionParamsSchema,
  paymentActionResponseSchema,
  paymentDetailsResponseSchema,
} from './payment.schema';

// Credit schemas
export {
  creditTransactionTypeSchema,
  relatedEntityTypeSchema,
  creditTransactionSchema,
  creditTransactionListParamsSchema,
  creditTransactionListResponseSchema,
  creditBalanceSchema,
} from './credit.schema';

// Financial schemas
export {
  financialSummaryParamsSchema,
  financialSummarySchema,
} from './financial.schema';
```

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-01-08  
**Next Artifact**: `contracts/` directory
