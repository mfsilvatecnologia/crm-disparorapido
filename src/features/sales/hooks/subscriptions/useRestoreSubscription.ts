/**
 * useRestoreSubscription Hook
 *
 * TanStack Query mutation para retomar assinatura cancelada.
 * Pode ser com cartão já usado (sem payload) ou com outro cartão (payload.creditCard).
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restoreSubscription, type RestoreSubscriptionPayload } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import { subscriptionsKeys } from './useSubscriptions';
import toast from 'react-hot-toast';

export function useRestoreSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      payload = {},
    }: {
      subscriptionId: string;
      payload?: RestoreSubscriptionPayload;
    }) => restoreSubscription(subscriptionId, payload),

    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.list() });
      toast.success('Assinatura retomada com sucesso!');
      if (subscription.asaasInvoiceUrl) {
        toast('Cadastre o cartão no link da fatura para ativar.', {
          duration: 8000,
          icon: '🔗',
        });
      }
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao retomar assinatura. Tente novamente.');
    },
  });
}
