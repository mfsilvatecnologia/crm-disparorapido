/**
 * useCreditBalance Hook
 * 
 * TanStack Query hook for fetching credit balance
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCreditBalance } from '../../api/creditsApi';
import { estimateLeadsPurchasable } from '../../services/creditService';

/**
 * Query key factory for credits
 */
export const creditsKeys = {
  all: ['credits'] as const,
  balance: () => [...creditsKeys.all, 'balance'] as const,
  packages: () => [...creditsKeys.all, 'packages'] as const,
  transactions: () => [...creditsKeys.all, 'transactions'] as const,
  transactionsList: (filters: any) => [...creditsKeys.transactions(), filters] as const,
};

/**
 * Hook to fetch credit balance
 */
export function useCreditBalance() {
  const query = useQuery({
    queryKey: creditsKeys.balance(),
    queryFn: fetchCreditBalance,
    staleTime: 1000 * 30, // 30 seconds - balance changes frequently
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    refetchInterval: 1000 * 60, // Refetch every 60 seconds
    retry: 2,
  });

  // Compute derived values
  const balance = query.data;
  const currentBalance = balance?.balance ?? 0;
  const estimatedLeads = balance ? estimateLeadsPurchasable(balance) : 0;
  const hasCredits = currentBalance > 0;

  return {
    ...query,
    balance,
    currentBalance,
    estimatedLeads,
    hasCredits,
  };
}
