/**
 * usePaymentDetails Hook
 * React Query hook for fetching single payment
 */

import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { paymentKeys } from '../queryKeys';

export function usePaymentDetails(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsApi.getPaymentById(id),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!id, // Only fetch if ID is provided
  });
}
