/**
 * useCancelSubscription Hook
 * 
 * TanStack Query mutation hook for canceling subscription
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelSubscription } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import toast from 'react-hot-toast';
import type { CancelSubscriptionSchema } from '../../schemas';

/**
 * Hook to cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      subscriptionId, 
      data 
    }: { 
      subscriptionId: string; 
      data: CancelSubscriptionSchema;
    }) => cancelSubscription(subscriptionId, data),
    
    onSuccess: (subscription, variables) => {
      // Invalidate and refetch subscription query
      queryClient.invalidateQueries({ 
        queryKey: subscriptionKeys.current() 
      });
      
      // Show success message
      const immediate = variables.data.cancelarImediatamente;
      toast.success(
        immediate 
          ? 'Assinatura cancelada imediatamente.' 
          : 'Assinatura será cancelada ao final do período atual.'
      );
    },
    
    onError: (error: any) => {
      // Show error message
      const message = error.message || 'Erro ao cancelar assinatura. Tente novamente.';
      toast.error(message);
    },
  });
}
