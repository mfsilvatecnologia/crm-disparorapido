import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliatePixKeys(enabled = true) {
  return useQuery({
    queryKey: affiliateKeys.pixKeys(),
    queryFn: () => affiliatesApi.getAffiliatePixKeys(),
    enabled,
    staleTime: 30 * 1000,
  });
}
