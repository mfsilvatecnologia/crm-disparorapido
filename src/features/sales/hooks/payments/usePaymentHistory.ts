/**
 * usePaymentHistory Hook
 * 
 * TanStack Query hook for fetching payment history
 */

import { useQuery } from '@tanstack/react-query';
import { getPayments } from '../../api/paymentsApi';
import type { PaymentListParams } from '../../types';

/**
 * Query key factory for payments
 */
export const paymentsKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (filters: PaymentListParams) => [...paymentsKeys.lists(), filters] as const,
  detail: (id: string) => [...paymentsKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch payment history
 */
export function usePaymentHistory(filters?: PaymentListParams) {
  return useQuery({
    queryKey: paymentsKeys.list(filters || {}),
    queryFn: () => getPayments(filters || {}),
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });
}
