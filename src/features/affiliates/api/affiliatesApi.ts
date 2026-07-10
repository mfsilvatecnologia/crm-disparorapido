import { apiClient } from '@/lib/api-client';
import { z } from 'zod';
import {
  affiliateCodeSchema,
  affiliateStatisticsSchema,
  commissionListResponseSchema,
  affiliateClienteRowSchema,
  affiliateRepasseRowSchema,
  affiliatePixKeySchema,
  affiliateCadastroSchema,
  affiliateCadastroResubmitResponseSchema,
  affiliateSaldoMesDetalheSchema,
} from '../schemas';
import {
  AffiliateCode,
  AffiliateStatistics,
  CommissionListParams,
  CommissionListResponse,
  AffiliateClienteIndicado,
  AffiliateRepasseRow,
  AffiliatePixKey,
  AffiliateCadastro,
  AffiliateCadastroResubmitBody,
  AffiliateSaldoMesDetalhe,
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

export async function getAffiliateCadastro(): Promise<AffiliateCadastro> {
  const response = await apiClient.get('/api/v1/afiliados/me/cadastro');
  const payload = extractData(response);
  return affiliateCadastroSchema.parse(payload);
}

export async function resubmitAffiliateCadastro(body: AffiliateCadastroResubmitBody) {
  const response = await apiClient.patch('/api/v1/afiliados/me/cadastro/reenviar', body);
  const payload = extractData(response);
  return affiliateCadastroResubmitResponseSchema.parse(payload);
}

export async function getAffiliateStatistics(periodo?: string): Promise<AffiliateStatistics> {
  const response = await apiClient.get('/api/v1/afiliados/estatisticas', {
    params: periodo ? { periodo } : undefined,
  });
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
  chave_pix_tipo: string;
}): Promise<{ ok: boolean }> {
  const response = await apiClient.patch('/api/v1/afiliados/me/chave-pix', body);
  const payload = extractData(response);
  return z.object({ ok: z.literal(true) }).parse(payload);
}

export async function getAffiliatePixKeys(): Promise<AffiliatePixKey[]> {
  const response = await apiClient.get<unknown>('/api/v1/afiliados/me/chaves-pix');
  const payload = extractData(response);
  const arr = Array.isArray(payload) ? payload : [];
  const parsed = z.array(affiliatePixKeySchema).safeParse(arr);
  if (!parsed.success) {
    console.warn('[affiliatesApi] getAffiliatePixKeys schema', parsed.error.flatten());
    return [];
  }
  return parsed.data;
}

export async function getAffiliateSaldoMesDetalhe(
  periodoReferencia: string
): Promise<AffiliateSaldoMesDetalhe> {
  const response = await apiClient.get(
    `/api/v1/afiliados/me/repasses/${encodeURIComponent(periodoReferencia)}/detalhes`
  );
  const payload = extractData(response);
  return affiliateSaldoMesDetalheSchema.parse(payload);
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

const affiliateToolSubscriptionStatusSchema = z.object({
  hasExtensionSubscription: z.boolean(),
  hasActiveAccess: z.boolean(),
  subscriptionId: z.string().optional(),
  status: z.string().optional(),
  plano: z.enum(['mensal', 'anual']).optional(),
});

export type AffiliateToolSubscriptionStatus = z.infer<typeof affiliateToolSubscriptionStatusSchema>;

export async function getAffiliateToolSubscriptionStatus(): Promise<AffiliateToolSubscriptionStatus> {
  const response = await apiClient.get('/api/v1/afiliados/assinatura-ferramenta');
  const payload = extractData(response);
  return affiliateToolSubscriptionStatusSchema.parse(payload);
}

export interface SubscribeAffiliateToolPayload {
  plano: 'mensal' | 'anual';
  billing_type?: 'PIX' | 'CREDIT_CARD';
  phone?: string;
  credit_card_token?: string;
  credit_card?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  credit_card_holder_info?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
  };
  billing_address?: {
    postalCode: string;
    address: string;
    addressNumber: string;
    addressComplement?: string;
    province: string;
  };
}

const subscribeAffiliateToolResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  pix_qr_code_url: z.string().optional(),
  pix_copy_paste_code: z.string().optional(),
  pix_automatic_authorization_id: z.string().optional(),
  subscription_id: z.string().optional(),
});

export async function subscribeAffiliateTool(payload: SubscribeAffiliateToolPayload) {
  const response = await apiClient.post('/api/v1/afiliados/assinar-ferramenta', payload);
  const data = extractData(response);
  return subscribeAffiliateToolResponseSchema.parse(data);
}

export const affiliatesApi = {
  getAffiliateCode,
  getAffiliateCadastro,
  resubmitAffiliateCadastro,
  getAffiliateStatistics,
  getAffiliateCommissions,
  getAffiliateClients,
  patchAffiliateChavePix,
  getAffiliatePixKeys,
  getAffiliateRepasses,
  getAffiliateSaldoMesDetalhe,
  solicitAffiliateRepasseWithNf,
  getAffiliateRepasseComprovantePixUrl,
  getAffiliateToolSubscriptionStatus,
  subscribeAffiliateTool,
};
