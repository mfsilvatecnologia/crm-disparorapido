/**
 * usePurchasedLeads Hook
 * 
 * TanStack Query hook for fetching purchased leads
 */

import { useQuery } from '@tanstack/react-query';
import { fetchPurchasedLeads } from '../../api/marketplaceApi';
import { marketplaceKeys } from './useMarketplaceLeads';

/**
 * Hook to fetch purchased leads
 */
export function usePurchasedLeads(filters?: {
  page?: number;
  limit?: number;
  segmento?: string[];
}) {
  return useQuery({
    queryKey: marketplaceKeys.purchasedList(filters || {}),
    queryFn: () => fetchPurchasedLeads(filters),
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });
}
