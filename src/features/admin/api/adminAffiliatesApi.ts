import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const adminAfiliadoListItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  nome: z.string().optional(),
  email: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  ref_slug: z.string(),
  area_atuacao: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  razao_social: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  rua: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  modo_repasse: z.string(),
  split_percentual: z.coerce.number(),
  comissao_mensal_centavos: z.coerce.number().optional(),
  comissao_anual_centavos: z.coerce.number().optional(),
  tipo_plano: z.string(),
  status_assinatura: z.string(),
  status_cadastro: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
});

const adminAfiliadoListResponseSchema = z.object({
  items: z.array(adminAfiliadoListItemSchema),
  total: z.number(),
  pendentes_cadastro: z.number().optional(),
  limit: z.number(),
  offset: z.number(),
});

const adminRepasseHistoricoSchema = z.object({
  id: z.string(),
  status_anterior: z.string().nullable(),
  status_novo: z.string(),
  observacao: z.string().nullable().optional(),
  alterado_por_user_id: z.string().nullable().optional(),
  alterado_por_nome: z.string().nullable().optional(),
  alterado_por_tipo: z.enum(['admin', 'afiliado', 'sistema']),
  created_at: z.string(),
});

const adminRepasseRowSchema = z.object({
  id: z.string(),
  afiliado_id: z.string(),
  periodo_referencia: z.string(),
  valor_calculado_centavos: z.coerce.number(),
  status: z.string(),
  storage_bucket: z.string().nullable().optional(),
  storage_object_key: z.string().nullable().optional(),
  mime: z.string().nullable().optional(),
  tamanho_bytes: z.coerce.number().nullable().optional(),
  uploaded_at: z.string().nullable().optional(),
  admin_observacao: z.string().nullable().optional(),
  paid_at: z.string().nullable().optional(),
  paid_by_user_id: z.string().nullable().optional(),
  comprovante_pix_bucket: z.string().nullable().optional(),
  comprovante_pix_object_key: z.string().nullable().optional(),
  comprovante_pix_mime: z.string().nullable().optional(),
  comprovante_pix_tamanho_bytes: z.coerce.number().nullable().optional(),
  comprovante_pix_uploaded_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  historico_status: z.array(adminRepasseHistoricoSchema).optional().default([]),
  afiliado_nome: z.string().nullable().optional(),
  afiliado_ref_slug: z.string().nullable().optional(),
});

const adminChavePixHistoricoSchema = z.object({
  id: z.string(),
  chave_pix: z.string().nullable(),
  chave_pix_tipo: z.string().nullable().optional(),
  ativa: z.boolean(),
  created_at: z.string(),
});

const adminAfiliadoDetailSchema = z.object({
  afiliado: z.object({
    id: z.string(),
    user_id: z.string(),
    nome: z.string().optional(),
    email: z.string().nullable().optional(),
    cnpj: z.string().nullable().optional(),
    ref_slug: z.string(),
    area_atuacao: z.string().nullable().optional(),
    telefone: z.string().nullable().optional(),
    razao_social: z.string().nullable().optional(),
    cep: z.string().nullable().optional(),
    rua: z.string().nullable().optional(),
    numero: z.string().nullable().optional(),
    complemento: z.string().nullable().optional(),
    bairro: z.string().nullable().optional(),
    cidade: z.string().nullable().optional(),
    estado: z.string().nullable().optional(),
    modo_repasse: z.string(),
    split_percentual: z.coerce.number(),
    comissao_mensal_centavos: z.coerce.number().optional(),
    comissao_anual_centavos: z.coerce.number().optional(),
    tipo_plano: z.string(),
    status_assinatura: z.string(),
    status_cadastro: z.string().optional(),
    motivo_rejeicao: z.string().nullable().optional(),
    permite_correcao_cadastro: z.boolean().nullable().optional(),
    cadastro_aprovado_em: z.string().nullable().optional(),
    cadastro_aprovado_por: z.string().nullable().optional(),
    cadastro_moderado_por_nome: z.string().nullable().optional(),
    chave_pix: z.string().nullable().optional(),
    chave_pix_tipo: z.string().nullable().optional(),
    asaas_wallet_id: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  }),
  clientes: z.array(z.unknown()).default([]),
  repasses: z.array(adminRepasseRowSchema).default([]),
  chaves_pix: z.array(adminChavePixHistoricoSchema).default([]),
});

export type AdminAfiliadoListItem = z.infer<typeof adminAfiliadoListItemSchema>;
export type AdminAfiliadoListResponse = z.infer<typeof adminAfiliadoListResponseSchema>;
export type AdminRepasseRow = z.infer<typeof adminRepasseRowSchema>;
export type AdminAfiliadoDetail = z.infer<typeof adminAfiliadoDetailSchema>;

export async function adminListAfiliados(params?: {
  repasse_status?: string;
  status_cadastro?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminAfiliadoListResponse> {
  const data = await apiClient.get<unknown>('/api/v1/admin/afiliados', { params });
  return adminAfiliadoListResponseSchema.parse(data);
}

export async function adminListRepassesPendentes(): Promise<AdminRepasseRow[]> {
  const data = await apiClient.get<unknown>('/api/v1/admin/afiliados/repasses-pendentes');
  const arr = Array.isArray(data) ? data : [];
  return z.array(adminRepasseRowSchema).parse(arr);
}

export async function adminGetAfiliado(afiliadoId: string): Promise<AdminAfiliadoDetail> {
  const data = await apiClient.get<unknown>(`/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}`);
  return adminAfiliadoDetailSchema.parse(data);
}

export async function adminGetRepasseNfSignedUrl(
  afiliadoId: string,
  repasseId: string
): Promise<{ signedUrl: string; expiresIn: number }> {
  const data = await apiClient.get<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}/repasse/${encodeURIComponent(repasseId)}/nf-url`
  );
  return z.object({ signedUrl: z.string(), expiresIn: z.number() }).parse(data);
}

export async function adminGetRepasseComprovantePixSignedUrl(
  afiliadoId: string,
  repasseId: string
): Promise<{ signedUrl: string; expiresIn: number }> {
  const data = await apiClient.get<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}/repasse/${encodeURIComponent(repasseId)}/comprovante-pix-url`
  );
  return z.object({ signedUrl: z.string(), expiresIn: z.number() }).parse(data);
}

export async function adminUploadRepasseComprovantePix(params: {
  afiliadoId: string;
  repasseId: string;
  file: File;
  marcar_pago?: boolean;
}): Promise<AdminRepasseRow> {
  const form = new FormData();
  form.append('comprovante', params.file);
  if (params.marcar_pago) {
    form.append('marcar_pago', 'true');
  }
  const client = apiClient.getClient();
  const { data } = await client.post<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(params.afiliadoId)}/repasse/${encodeURIComponent(params.repasseId)}/comprovante-pix`,
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
  return adminRepasseRowSchema.parse(data);
}

export async function adminPatchRepasse(
  afiliadoId: string,
  repasseId: string,
  body: { status: string; admin_observacao?: string | null }
): Promise<AdminRepasseRow> {
  const data = await apiClient.patch<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}/repasse/${encodeURIComponent(repasseId)}`,
    body
  );
  return adminRepasseRowSchema.parse(data);
}

export async function adminPatchAfiliadoCadastro(
  afiliadoId: string,
  body: {
    action: 'aprovar' | 'rejeitar' | 'revogar_rejeicao';
    motivo?: string;
    permite_correcao_cadastro?: boolean;
  }
): Promise<{
  id: string;
  status_cadastro: string;
  motivo_rejeicao: string | null;
  permite_correcao_cadastro: boolean | null;
}> {
  const response = await apiClient.patch<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}/cadastro`,
    body
  );
  const payload =
    response && typeof response === 'object' && 'data' in response
      ? (response as { data: unknown }).data
      : response;
  return z
    .object({
      id: z.string(),
      status_cadastro: z.string(),
      motivo_rejeicao: z.string().nullable(),
      permite_correcao_cadastro: z.boolean().nullable().optional(),
    })
    .parse(payload);
}

export interface AdminPatchAfiliadoBody {
  split_percentual?: number;
  comissao_mensal_centavos?: number;
  comissao_anual_centavos?: number;
  tipo_plano?: string;
  area_atuacao?: string | null;
  chave_pix?: string | null;
  chave_pix_tipo?: string | null;
  created_at?: string;
}

export async function adminPatchAfiliado(
  afiliadoId: string,
  body: AdminPatchAfiliadoBody
): Promise<{ id: string }> {
  const response = await apiClient.patch<unknown>(
    `/api/v1/admin/afiliados/${encodeURIComponent(afiliadoId)}`,
    body
  );
  const payload =
    response && typeof response === 'object' && 'data' in response
      ? (response as { data: unknown }).data
      : response;
  return z.object({ id: z.string() }).parse(payload);
}

export const adminAffiliatesApi = {
  listAfiliados: adminListAfiliados,
  patchAfiliado: adminPatchAfiliado,
  listRepassesPendentes: adminListRepassesPendentes,
  getAfiliado: adminGetAfiliado,
  getRepasseNfSignedUrl: adminGetRepasseNfSignedUrl,
  getRepasseComprovantePixSignedUrl: adminGetRepasseComprovantePixSignedUrl,
  uploadRepasseComprovantePix: adminUploadRepasseComprovantePix,
  patchRepasse: adminPatchRepasse,
  patchCadastro: adminPatchAfiliadoCadastro,
};
