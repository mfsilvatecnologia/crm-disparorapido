/**
 * useSubscription Hook
 * 
 * TanStack Query hook for fetching current subscription
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCurrentSubscription } from '../../api/subscriptionsApi';
import { 
  isTrialActive,
  getDaysRemainingInTrial 
} from '../../types';
import { isSubscriptionActive } from '../../services/subscriptionService';

/**
 * Query key factory for subscriptions
 */
export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  status: () => [...subscriptionKeys.all, 'status'] as const,
};

/**
 * Hook to fetch current company subscription
 */
export function useSubscription() {
  const query = useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: fetchCurrentSubscription,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
    // Refetch more frequently if in trial
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && isTrialActive(data)) {
        return 1000 * 30; // 30 seconds during trial
      }
      return false; // No auto-refetch otherwise
    },
  });

  // Compute derived values
  const subscription = query.data;
  const isInTrial = subscription ? isTrialActive(subscription) : false;
  const daysRemaining = subscription ? getDaysRemainingInTrial(subscription) : null;
  const hasActiveSubscription = subscription ? isSubscriptionActive(subscription) : false;

  return {
    ...query,
    subscription,
    isInTrial,
    daysRemaining,
    hasActiveSubscription,
  };
}
