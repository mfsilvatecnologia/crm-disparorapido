/**
 * useCreditPackages Hook
 * 
 * TanStack Query hook for fetching credit packages
 */

import { useQuery } from '@tanstack/react-query';
import { fetchCreditPackages } from '../../api/creditsApi';
import { creditsKeys } from './useCreditBalance';

/**
 * Hook to fetch credit packages
 */
export function useCreditPackages() {
  return useQuery({
    queryKey: creditsKeys.packages(),
    queryFn: fetchCreditPackages,
    staleTime: 1000 * 60 * 60, // 1 hour - packages don't change often
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
    retry: 2,
    select: (packages) => {
      // Sort by quantity (smallest first) for better UX
      return [...packages].sort((a, b) => a.quantidade_creditos - b.quantidade_creditos);
    },
  });
}
