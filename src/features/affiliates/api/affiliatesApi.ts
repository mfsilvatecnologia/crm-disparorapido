import { apiClient } from '@/lib/api-client';
import { z } from 'zod';
import {
  affiliateCodeSchema,
  affiliateStatisticsSchema,
  commissionListResponseSchema,
  affiliateClienteRowSchema,
  affiliateRepasseRowSchema,
} from '../schemas';
import {
  AffiliateCode,
  AffiliateStatistics,
  CommissionListParams,
  CommissionListResponse,
  AffiliateClienteIndicado,
  AffiliateRepasseRow,
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

export async function getAffiliateClients(afiliadoId: string): Promise<AffiliateClienteIndicado[]> {
  const response = await apiClient.get<unknown>(
    `/api/v1/afiliados/${encodeURIComponent(afiliadoId)}/clientes`
  );
  const payload = extractData(response);
  const arr = Array.isArray(payload) ? payload : [];
  const parsed = z.array(affiliateClienteRowSchema).safeParse(arr);
  if (!parsed.success) {
    console.warn('[affiliatesApi] getAffiliateClients schema', parsed.error.flatten());
    return [];
  }
  return parsed.data;
}

export async function patchAffiliateChavePix(body: {
  chave_pix: string;
  chave_pix_tipo?: string;
}): Promise<{ ok: boolean }> {
  const response = await apiClient.patch('/api/v1/afiliados/me/chave-pix', body);
  const payload = extractData(response);
  return z.object({ ok: z.literal(true) }).parse(payload);
}

export async function getAffiliateRepasses(afiliadoId: string): Promise<AffiliateRepasseRow[]> {
  const response = await apiClient.get<unknown>(
    `/api/v1/afiliados/${encodeURIComponent(afiliadoId)}/repassos`
  );
  const payload = extractData(response);
  const arr = Array.isArray(payload) ? payload : [];
  return z.array(affiliateRepasseRowSchema).parse(arr);
}

export async function solicitAffiliateRepasseWithNf(params: {
  afiliadoId: string;
  periodoReferencia: string;
  file: File;
}): Promise<{ id: string; status: string; valorCentavos: number }> {
  const form = new FormData();
  form.append('periodo_referencia', params.periodoReferencia);
  form.append('nf', params.file);

  const client = apiClient.getClient();
  const { data } = await client.post<unknown>(
    `/api/v1/afiliados/${encodeURIComponent(params.afiliadoId)}/solicitar-repasse`,
    form,
    {
      transformRequest: [
        (body, headers) => {
          if (body instanceof FormData) {
            delete headers['Content-Type'];
          }
          return body;
        },
      ],
    }
  );

  return z
    .object({
      id: z.string(),
      status: z.string(),
      valorCentavos: z.coerce.number(),
    })
    .parse(data);
}

export async function getAffiliateRepasseComprovantePixUrl(params: {
  afiliadoId: string;
  repasseId: string;
}): Promise<{ signedUrl: string; expiresIn: number }> {
  const data = await apiClient.get<unknown>(
    `/api/v1/afiliados/${encodeURIComponent(params.afiliadoId)}/repasse/${encodeURIComponent(params.repasseId)}/comprovante-pix-url`
  );
  return z.object({ signedUrl: z.string(), expiresIn: z.number() }).parse(data);
}

export const affiliatesApi = {
  getAffiliateCode,
  getAffiliateStatistics,
  getAffiliateCommissions,
  getAffiliateClients,
  patchAffiliateChavePix,
  getAffiliateRepasses,
  solicitAffiliateRepasseWithNf,
  getAffiliateRepasseComprovantePixUrl,
};
