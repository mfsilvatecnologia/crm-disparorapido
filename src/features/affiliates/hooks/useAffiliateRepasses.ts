import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliateRepasses(afiliadoId: string | undefined) {
  return useQuery({
    queryKey: affiliateKeys.repasses(afiliadoId ?? ''),
    queryFn: () => affiliatesApi.getAffiliateRepasses(afiliadoId!),
    enabled: Boolean(afiliadoId),
    staleTime: 30 * 1000,
  });
}
