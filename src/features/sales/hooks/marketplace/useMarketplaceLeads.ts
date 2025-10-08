/**
 * useMarketplaceLeads Hook
 * 
 * TanStack Query hook for fetching marketplace leads
 */

import { useQuery } from '@tanstack/react-query';
import { fetchMarketplaceLeads } from '../../api/marketplaceApi';
import type { LeadSearchFiltersSchema } from '../../schemas';

/**
 * Query key factory for marketplace
 */
export const marketplaceKeys = {
  all: ['marketplace'] as const,
  leads: () => [...marketplaceKeys.all, 'leads'] as const,
  leadsList: (filters: LeadSearchFiltersSchema) => 
    [...marketplaceKeys.leads(), filters] as const,
  lead: (id: string) => [...marketplaceKeys.all, 'lead', id] as const,
  purchased: () => [...marketplaceKeys.all, 'purchased'] as const,
  purchasedList: (filters: any) => 
    [...marketplaceKeys.purchased(), filters] as const,
};

/**
 * Hook to fetch marketplace leads
 */
export function useMarketplaceLeads(filters?: LeadSearchFiltersSchema) {
  return useQuery({
    queryKey: marketplaceKeys.leadsList(filters || {}),
    queryFn: () => fetchMarketplaceLeads(filters),
    staleTime: 1000 * 60, // 1 minute - marketplace changes frequently
    gcTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 2,
  });
}
