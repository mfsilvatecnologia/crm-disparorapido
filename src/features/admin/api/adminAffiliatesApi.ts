import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const adminAfiliadoListItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  nome: z.string().optional(),
  ref_slug: z.string(),
  modo_repasse: z.string(),
  split_percentual: z.coerce.number(),
  tipo_plano: z.string(),
  status_assinatura: z.string(),
  created_at: z.string(),
});

const adminAfiliadoListResponseSchema = z.object({
  items: z.array(adminAfiliadoListItemSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
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
});

const adminAfiliadoDetailSchema = z.object({
  afiliado: z.object({
    id: z.string(),
    user_id: z.string(),
    nome: z.string().optional(),
    ref_slug: z.string(),
    modo_repasse: z.string(),
    split_percentual: z.coerce.number(),
    tipo_plano: z.string(),
    status_assinatura: z.string(),
    chave_pix: z.string().nullable().optional(),
    chave_pix_tipo: z.string().nullable().optional(),
    asaas_wallet_id: z.string().nullable().optional(),
  }),
  clientes: z.array(z.unknown()).default([]),
  repasses: z.array(adminRepasseRowSchema).default([]),
});

export type AdminAfiliadoListItem = z.infer<typeof adminAfiliadoListItemSchema>;
export type AdminAfiliadoListResponse = z.infer<typeof adminAfiliadoListResponseSchema>;
export type AdminRepasseRow = z.infer<typeof adminRepasseRowSchema>;
export type AdminAfiliadoDetail = z.infer<typeof adminAfiliadoDetailSchema>;

export async function adminListAfiliados(params?: {
  repasse_status?: string;
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

export const adminAffiliatesApi = {
  listAfiliados: adminListAfiliados,
  listRepassesPendentes: adminListRepassesPendentes,
  getAfiliado: adminGetAfiliado,
  getRepasseNfSignedUrl: adminGetRepasseNfSignedUrl,
  getRepasseComprovantePixSignedUrl: adminGetRepasseComprovantePixSignedUrl,
  uploadRepasseComprovantePix: adminUploadRepasseComprovantePix,
  patchRepasse: adminPatchRepasse,
};
