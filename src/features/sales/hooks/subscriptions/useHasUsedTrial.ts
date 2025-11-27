/**
 * useHasUsedTrial Hook
 * 
 * TanStack Query hook for checking if company has already used trial
 */

import { useQuery } from '@tanstack/react-query';
import { checkHasUsedTrial } from '../../api/subscriptionsApi';

/**
 * Query key factory for trial usage check
 */
export const trialUsageKeys = {
  all: ['trialUsage'] as const,
  check: () => [...trialUsageKeys.all, 'check'] as const,
};

/**
 * Hook to check if customer has already used their trial period
 * Returns true if any subscription with hasTrial=true exists
 */
export function useHasUsedTrial() {
  return useQuery({
    queryKey: trialUsageKeys.check(),
    queryFn: checkHasUsedTrial,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes cache
    retry: 1,
  });
}
