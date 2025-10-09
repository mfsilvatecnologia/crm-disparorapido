/**
 * useFinancialSummary Hook
 * React Query hook for fetching financial summary
 */

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
