import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliateCode() {
  return useQuery({
    queryKey: affiliateKeys.code(),
    queryFn: affiliatesApi.getAffiliateCode,
    staleTime: 5 * 60 * 1000,
  });
}
