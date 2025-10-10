import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampaignCharges, fetchCampaignChargesSummary, fetchBillingConfiguration, updateBillingConfiguration } from '../services/stages'
import { QUERY_KEYS, CACHE_TIMES } from '../types/constants'

export function useCampaignCharges(campaignId: string, filters?: any) {
  return useQuery({
    queryKey: QUERY_KEYS.charges(campaignId, filters),
    queryFn: () => fetchCampaignCharges(campaignId, filters),
    enabled: !!campaignId,
    staleTime: CACHE_TIMES.short,
  })
}

export function useCampaignChargesSummary(campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.chargesSummary(campaignId),
    queryFn: () => fetchCampaignChargesSummary(campaignId),
    enabled: !!campaignId,
    staleTime: CACHE_TIMES.medium,
  })
}

export function useBillingConfiguration() {
  return useQuery({
    queryKey: QUERY_KEYS.billingConfig(),
    queryFn: () => fetchBillingConfiguration(),
    staleTime: CACHE_TIMES.long,
  })
}

export function useUpdateBillingConfiguration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateBillingConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.billingConfig() })
    },
  })
}

