/**
 * useRefundPayment Hook
 * Mutation hook for refunding payments with optimistic updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../../api/paymentsApi';
import { paymentKeys } from '../queryKeys';
import { Payment } from '../../types';

export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      paymentsApi.refundPayment(id, reason),
    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: paymentKeys.detail(id) });

      // Snapshot previous value
      const previousPayment = queryClient.getQueryData(paymentKeys.detail(id));

      // Optimistically update cache
      queryClient.setQueryData(paymentKeys.detail(id), (old: Payment | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: 'refunded' as const,
        };
      });

      return { previousPayment };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousPayment) {
        queryClient.setQueryData(paymentKeys.detail(id), context.previousPayment);
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['financial', 'summary'] });
    },
  });
}
