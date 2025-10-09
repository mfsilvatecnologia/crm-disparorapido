/**
 * usePayments Hook
 * React Query hook for fetching payment list
 */

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
