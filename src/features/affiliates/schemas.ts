import { z } from 'zod';

export const commissionOriginTypeSchema = z.enum([
  'subscription',
  'subscription_payment',
  'credit_purchase',
  'subscription_renewal',
]);

export const commissionStatusSchema = z.enum(['pending', 'credited', 'failed']);

export const affiliateCodeSchema = z.object({
  codigoAfiliado: z.string(),
  /** UUID do afiliado — usar em rotas `/afiliados/:id/...` (codigoAfiliado é o slug público). */
  codigoAfiliadoId: z.string().uuid().optional(),
  comissaoPadraoTipo: z.enum(['percentual', 'fixo']),
  comissaoPadraoValor: z.coerce.number(),
  ativo: z.boolean(),
  linkIndicacao: z.string(),
  tipoPlano: z.enum(['ISENTO', 'MENSALIDADE']).optional(),
  statusAssinatura: z.enum(['ATIVA', 'INADIMPLENTE', 'ISENTA']).optional(),
  mensalidadePagamentoUrl: z.string().nullable().optional(),
  modoRepasse: z.enum(['ASAAS_SPLIT', 'MANUAL_NF']).optional(),
});

export const commissionSummarySchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  tipoOrigem: commissionOriginTypeSchema,
  comissaoCreditos: z.coerce.number(),
  status: commissionStatusSchema,
  createdAt: z.string(),
});

export const affiliateFinanceiroPainelSchema = z.object({
  vendasBrutasCentavos: z.coerce.number(),
  ganhoLiquidoCentavos: z.coerce.number(),
  totalRecuperacaoCentavos: z.coerce.number(),
  faturasTotal: z.coerce.number(),
  faturasPagas: z.coerce.number(),
  faturasAbertas: z.coerce.number(),
  faturasCanceladas: z.coerce.number(),
  faturasExpiradas: z.coerce.number(),
});

export const affiliateStatisticsSchema = z.object({
  codigoAfiliado: z.string(),
  codigoAfiliadoId: z.string().uuid().optional(),
  totalIndicacoes: z.coerce.number(),
  totalComissoesCreditos: z.coerce.number(),
  totalValorGeradoCentavos: z.coerce.number(),
  ativo: z.boolean(),
  createdAt: z.string(),
  ultimasComissoes: z.array(commissionSummarySchema).optional().default([]),
  tipoPlano: z.enum(['ISENTO', 'MENSALIDADE']).optional(),
  statusAssinatura: z.enum(['ATIVA', 'INADIMPLENTE', 'ISENTA']).optional(),
  mensalidadePagamentoUrl: z.string().nullable().optional(),
  modoRepasse: z.enum(['ASAAS_SPLIT', 'MANUAL_NF']).optional(),
  saldoDisponivelCentavos: z.coerce.number().nullable().optional(),
  saldoPendenteRepasseCentavos: z.coerce.number().nullable().optional(),
  financeiroPainel: affiliateFinanceiroPainelSchema.optional(),
});

export const commissionSchema = z.object({
  id: z.string(),
  afiliadoId: z.string().optional(),
  empresaIndicadaNome: z.string().optional().nullable(),
  tipoOrigem: commissionOriginTypeSchema,
  valorPagamentoCentavos: z.number(),
  comissaoCreditos: z.number(),
  status: commissionStatusSchema,
  criadoEm: z.string(),
  creditadoEm: z.string().nullable(),
});

export const commissionListResponseSchema = z.object({
  items: z.array(commissionSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const affiliateClienteRowSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => String(v)),
  status: z
    .union([z.string(), z.null(), z.undefined()])
    .optional()
    .transform((s) => (s == null || s === '' ? '—' : String(s))),
  value: z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }),
  created_at: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((v) => {
    if (v == null) return new Date(0).toISOString();
    if (typeof v === 'number') return new Date(v).toISOString();
    return String(v);
  }),
  empresa_id: z.string().nullable().optional(),
  billing_cycle: z.string().nullable().optional(),
  empresa_nome: z.string().nullable().optional(),
  produto_nome: z.string().nullable().optional(),
  plano_label: z.string().nullable().optional(),
  forma_pagamento: z.string().nullable().optional(),
  last_payment_date: z.string().nullable().optional(),
  next_due_date: z.string().nullable().optional(),
});

export const affiliateRepasseRowSchema = z.object({
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
