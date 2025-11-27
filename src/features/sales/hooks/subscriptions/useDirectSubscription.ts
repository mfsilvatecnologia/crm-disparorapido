/**
 * useDirectSubscription Hook
 * 
 * TanStack Query mutation hook for creating direct subscription (without trial)
 * Use this hook when the customer has already used their trial period.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDirectSubscription, CreateDirectSubscriptionRequest } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import toast from 'react-hot-toast';

/**
 * Hook to create a direct subscription (no trial validation)
 * Used when customer has already used their trial period
 */
export function useDirectSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDirectSubscriptionRequest) => 
      createDirectSubscription(data),
    
    onSuccess: (subscription) => {
      // Invalidate and refetch subscription query
      queryClient.invalidateQueries({ 
        queryKey: subscriptionKeys.current() 
      });
      
      // Show success message
      toast.success('Assinatura criada com sucesso!');
    },
    
    onError: (error: any) => {
      // Show error message
      const message = error.message || 'Erro ao criar assinatura. Tente novamente.';
      toast.error(message);
    },
  });
}
