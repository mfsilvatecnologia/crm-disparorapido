import { useQuery } from '@tanstack/react-query'
import { fetchLeadStageHistory } from '../services/stages'
import { QUERY_KEYS, CACHE_TIMES } from '../types/constants'

export function useLeadStageHistory(campaignId: string, contactId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transitions(campaignId, contactId),
    queryFn: () => fetchLeadStageHistory(campaignId, contactId),
    enabled: !!campaignId && !!contactId,
    staleTime: CACHE_TIMES.short,
  })
}

