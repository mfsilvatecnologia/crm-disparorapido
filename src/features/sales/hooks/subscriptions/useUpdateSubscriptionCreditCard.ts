/**
 * useUpdateSubscriptionCreditCard Hook
 *
 * TanStack Query mutation para atualizar cartão de crédito da assinatura.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSubscriptionCreditCard } from '../../api/subscriptionsApi';
import { subscriptionKeys } from './useSubscription';
import { subscriptionsKeys } from './useSubscriptions';
import toast from 'react-hot-toast';

/** Payload para atualizar cartão. Envie apenas creditCard; o backend preenche o titular com dados já cadastrados no Asaas. */
export type UpdateCreditCardPayload = {
  creditCard: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
  };
};

export function useUpdateSubscriptionCreditCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subscriptionId,
      payload,
    }: {
      subscriptionId: string;
      payload: UpdateCreditCardPayload;
    }) => updateSubscriptionCreditCard(subscriptionId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() });
      queryClient.invalidateQueries({ queryKey: subscriptionsKeys.list() });
      toast.success('Cartão atualizado com sucesso!');
    },

    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar cartão. Tente novamente.');
    },
  });
}
