/**
 * useFinancialSummary Hook
 * 
 * TanStack Query hook for fetching financial summary (Backend API)
 */

import { useQuery } from '@tanstack/react-query';
import { getFinancialSummary } from '../../api/paymentsApi';
import type { FinancialSummaryParams } from '../../types';

/**
 * Query key factory for financial summary
 */
export const financialSummaryKeys = {
  all: ['financialSummary'] as const,
  summary: (params: FinancialSummaryParams) => [...financialSummaryKeys.all, params] as const,
};

/**
 * Hook to fetch financial summary
 * GET /payments/summary
 */
export function useFinancialSummary(params?: FinancialSummaryParams) {
  return useQuery({
    queryKey: financialSummaryKeys.summary(params || {}),
    queryFn: () => getFinancialSummary(params),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    retry: 2,
  });
}
