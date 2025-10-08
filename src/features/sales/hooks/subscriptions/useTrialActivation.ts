/**
 * useTrialActivation Hook
 * 
 * TanStack Query mutation hook for activating trial subscription
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTrialSubscription } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import toast from 'react-hot-toast';
import type { CreateSubscriptionSchema } from '../../schemas';

/**
 * Hook to activate trial subscription
 */
export function useTrialActivation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubscriptionSchema) => 
      createTrialSubscription(data),
    
    onSuccess: (subscription) => {
      // Invalidate and refetch subscription query
      queryClient.invalidateQueries({ 
        queryKey: subscriptionKeys.current() 
      });
      
      // Show success message
      toast.success(
        `Trial ativado com sucesso! Você tem ${subscription.trialEnd ? 'acesso gratuito' : 'teste grátis'} por tempo limitado.`
      );
    },
    
    onError: (error: any) => {
      // Show error message
      const message = error.message || 'Erro ao ativar trial. Tente novamente.';
      toast.error(message);
    },
  });
}
