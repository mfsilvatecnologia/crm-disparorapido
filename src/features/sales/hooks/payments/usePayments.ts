/**
 * usePayments Hook
 * React Query hook for fetching payment list (Backend API)
 */

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getPaymentHistory } from '../../api/paymentsApi';
import { paymentKeys } from '../queryKeys';
import { PaymentListParams } from '../../types';

export function usePayments(params: PaymentListParams) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPaymentHistory(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
