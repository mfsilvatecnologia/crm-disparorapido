import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/contexts/AuthContext';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from './queryKeys';

/**
 * Usa o mesmo cache que useAffiliateCode (GET /afiliados/meu-codigo).
 * 404 = usuário não vinculado a registro de afiliado.
 * `affiliateId` é o UUID (`codigoAfiliadoId`) para rotas `/afiliados/:id/...`; `codigoAfiliado` é o slug público.
 */
export function useIsAffiliateUser() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: affiliateKeys.code(),
    queryFn: affiliatesApi.getAffiliateCode,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return {
    isAffiliate: query.isSuccess && !!query.data,
    isLoading: query.isPending || query.isFetching,
    affiliateId: query.data?.codigoAfiliadoId ?? query.data?.codigoAfiliado ?? null,
    code: query.data,
    query,
  };
}
