/**
 * usePurchaseLead Hook
 * 
 * TanStack Query mutation hook for purchasing lead access with credits
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseLeadAccess } from '../../api/creditsApi';
import { creditsKeys } from '../credits/useCreditBalance';
import { marketplaceKeys } from './useMarketplaceLeads';
import toast from 'react-hot-toast';
import type { PurchaseLeadSchema } from '../../schemas';
import type { CreditBalance } from '../../types';

/**
 * Hook to purchase lead access with credits
 */
export function usePurchaseLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseLeadSchema) => purchaseLeadAccess(data),
    
    // Optimistic update for credit balance
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: creditsKeys.balance() 
      });

      // Snapshot previous value
      const previousBalance = queryClient.getQueryData<CreditBalance>(
        creditsKeys.balance()
      );

      // Optimistically update balance (we don't know the exact cost yet)
      // This will be corrected when the mutation succeeds
      if (previousBalance) {
        queryClient.setQueryData<CreditBalance>(
          creditsKeys.balance(),
          {
            ...previousBalance,
            saldoAtual: previousBalance.saldoAtual, // Will update on success
          }
        );
      }

      return { previousBalance };
    },
    
    onSuccess: (response) => {
      // Update balance with actual values
      queryClient.setQueryData<CreditBalance>(
        creditsKeys.balance(),
        (old) => old ? {
          ...old,
          saldoAtual: response.novoSaldo,
          totalGasto: old.totalGasto + response.custo,
        } : old
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: creditsKeys.balance() 
      });
      queryClient.invalidateQueries({ 
        queryKey: creditsKeys.transactions() 
      });
      queryClient.invalidateQueries({ 
        queryKey: marketplaceKeys.purchased() 
      });

      // Show success message
      toast.success('Lead adquirido com sucesso! Dados completos disponíveis.');
    },
    
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousBalance) {
        queryClient.setQueryData(
          creditsKeys.balance(),
          context.previousBalance
        );
      }

      // Show error message
      const message = error.message || 'Erro ao adquirir lead. Tente novamente.';
      toast.error(message);
    },
  });
}
