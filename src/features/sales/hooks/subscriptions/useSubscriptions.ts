/**
 * useSubscriptions Hook
 * 
 * TanStack Query hook for fetching all subscriptions
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAllSubscriptions } from '../../api/subscriptionsApi';

/**
 * Query key factory for subscriptions list
 */
export const subscriptionsKeys = {
  all: ['subscriptions'] as const,
  list: () => [...subscriptionsKeys.all, 'list'] as const,
};

/**
 * Hook to fetch all company subscriptions
 */
export function useSubscriptions() {
  const query = useQuery({
    queryKey: subscriptionsKeys.list(),
    queryFn: fetchAllSubscriptions,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });

  return {
    subscriptions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
