import { useQuery } from '@tanstack/react-query'
import { fetchCampaignFunnelMetrics } from '../services/stages'
import { QUERY_KEYS } from '../types/constants'

export function useCampaignFunnelMetrics(campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.funnel(campaignId),
    queryFn: () => fetchCampaignFunnelMetrics(campaignId),
    enabled: !!campaignId,
    staleTime: 30_000,
  })
}

