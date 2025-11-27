import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliateStatistics() {
  return useQuery({
    queryKey: affiliateKeys.statistics(),
    queryFn: affiliatesApi.getAffiliateStatistics,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
