import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';
import { CommissionListParams } from '../types';

export function useAffiliateCommissions(params: CommissionListParams) {
  return useQuery({
    queryKey: affiliateKeys.commissions(params),
    queryFn: () => affiliatesApi.getAffiliateCommissions(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}
