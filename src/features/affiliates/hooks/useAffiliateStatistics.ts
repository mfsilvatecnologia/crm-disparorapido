import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliateStatistics(periodo?: string) {
  return useQuery({
    queryKey: affiliateKeys.statistics(periodo),
    queryFn: () => affiliatesApi.getAffiliateStatistics(periodo),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    retry: false,
  });
}
