import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

export function useAffiliateClients(afiliadoId: string | null) {
  return useQuery({
    queryKey: affiliateKeys.clients(afiliadoId ?? '__none__'),
    queryFn: () => affiliatesApi.getAffiliateClients(afiliadoId!),
    enabled: Boolean(afiliadoId),
    staleTime: 60 * 1000,
    retry: false,
  });
}
