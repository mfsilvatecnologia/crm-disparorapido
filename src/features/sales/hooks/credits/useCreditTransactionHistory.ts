/**
 * useCreditTransactionHistory Hook
 * 
 * TanStack Query hook for fetching credit transaction history (Backend API)
 */

import { useQuery } from '@tanstack/react-query';
import { getCreditTransactions } from '../../api/creditTransactionsApi';
import type { CreditTransactionListParams } from '../../types';

/**
 * Query key factory for credit transactions
 */
export const creditTransactionsKeys = {
  all: ['creditTransactions'] as const,
  lists: () => [...creditTransactionsKeys.all, 'list'] as const,
  list: (filters: CreditTransactionListParams) => [...creditTransactionsKeys.lists(), filters] as const,
};

/**
 * Hook to fetch credit transaction history
 * GET /payments/credits/transactions
 */
export function useCreditTransactionHistory(filters?: CreditTransactionListParams) {
  return useQuery({
    queryKey: creditTransactionsKeys.list(filters || {}),
    queryFn: () => getCreditTransactions(filters),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });
}