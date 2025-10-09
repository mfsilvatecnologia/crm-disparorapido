/**
 * Query Keys Configuration
 * TanStack Query keys for cache management
 */

import {
  PaymentListParams,
  CreditTransactionListParams,
  FinancialSummaryParams,
} from '../types';

/**
 * Payment Query Keys
 * Hierarchical keys for payment-related queries
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
 * Hierarchical keys for credit-related queries
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
 * Keys for financial summary queries
 */
export const financialKeys = {
  summary: (params: FinancialSummaryParams) => ['financial', 'summary', params] as const,
};
