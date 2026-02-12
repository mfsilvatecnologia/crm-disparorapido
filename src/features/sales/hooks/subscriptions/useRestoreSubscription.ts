/**
 * useRestoreSubscription Hook
 *
 * TanStack Query mutation para retomar assinatura cancelada.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restoreSubscription } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import { subscriptionsKeys } from './useSubscriptions';
import toast from 'react-hot-toast';

export function useRestoreSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: string) => restoreSubscription(subscriptionId),

    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.list() });
      toast.success('Assinatura retomada com sucesso!');
      if (subscription.asaasInvoiceUrl) {
        toast(
          `Cadastre o cartão para ativar: ${subscription.asaasInvoiceUrl}`,
          { duration: 8000 }
        );
      }
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao retomar assinatura. Tente novamente.');
    },
  });
}
