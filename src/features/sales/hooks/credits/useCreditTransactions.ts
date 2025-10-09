/**
 * useCreditTransactions Hook
 * React Query hook for fetching credit transactions
 */

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
