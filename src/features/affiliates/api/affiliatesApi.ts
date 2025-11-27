import { apiClient } from '@/lib/api-client';
import {
  affiliateCodeSchema,
  affiliateStatisticsSchema,
  commissionListResponseSchema,
} from '../schemas';
import {
  AffiliateCode,
  AffiliateStatistics,
  CommissionListParams,
  CommissionListResponse,
} from '../types';

function extractData<T>(response: any): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data;
  }

  return response as T;
}

export async function getAffiliateCode(): Promise<AffiliateCode> {
  const response = await apiClient.get('/api/v1/afiliados/meu-codigo');
  const payload = extractData(response);
  return affiliateCodeSchema.parse(payload);
}

export async function getAffiliateStatistics(): Promise<AffiliateStatistics> {
  const response = await apiClient.get('/api/v1/afiliados/estatisticas');
  const payload = extractData(response);
  return affiliateStatisticsSchema.parse(payload);
}

export async function getAffiliateCommissions(
  params?: CommissionListParams
): Promise<CommissionListResponse> {
  const response = await apiClient.get('/api/v1/afiliados/minhas-comissoes', {
    params,
  });

  const payload = extractData(response);
  return commissionListResponseSchema.parse(payload);
}

export const affiliatesApi = {
  getAffiliateCode,
  getAffiliateStatistics,
  getAffiliateCommissions,
};
