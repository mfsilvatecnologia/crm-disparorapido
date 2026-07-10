import { z } from 'zod';

export const commissionOriginTypeSchema = z.enum([
  'subscription',
  'subscription_payment',
  'credit_purchase',
  'subscription_renewal',
]);

export const commissionStatusSchema = z.enum(['pending', 'credited', 'failed']);

export const statusCadastroAfiliadoSchema = z.enum(['PENDENTE', 'APROVADO', 'REJEITADO']);

export const affiliateCodeSchema = z.object({
  codigoAfiliado: z.string(),
  /** UUID do afiliado — usar em rotas `/afiliados/:id/...` (codigoAfiliado é o slug público). */
  codigoAfiliadoId: z.string().uuid().optional(),
  comissaoMensalCentavos: z.coerce.number().optional(),
  comissaoAnualCentavos: z.coerce.number().optional(),
  comissaoPadraoTipo: z.enum(['percentual', 'fixo']).optional(),
  comissaoPadraoValor: z.coerce.number().optional(),
  ativo: z.boolean(),
  linkIndicacao: z.string().nullable(),
  statusCadastro: statusCadastroAfiliadoSchema.optional(),
  motivoRejeicao: z.string().nullable().optional(),
  permiteCorrecaoCadastro: z.boolean().nullable().optional(),
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
  periodoReferencia: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export const affiliateSaldoPorMesStatusSchema = z.union([
  z.literal('disponivel'),
  z.enum(['aguardando_nf', 'nf_enviada', 'em_analise', 'aprovado', 'pago', 'divergencia', 'cancelado']),
]);

export const affiliateSaldoPorMesSchema = z.object({
  periodoReferencia: z.string().regex(/^\d{4}-\d{2}$/),
  valorCentavos: z.coerce.number(),
  status: affiliateSaldoPorMesStatusSchema,
  repasseId: z.string().uuid().optional(),
  podeEnviarNf: z.boolean(),
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
  saldosPorMes: z.array(affiliateSaldoPorMesSchema).optional().default([]),
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

export const affiliatePixKeySchema = z.object({
  id: z.string(),
  chavePix: z.string(),
  chavePixTipo: z.string().nullable().optional(),
  ativa: z.boolean(),
  createdAt: z.string(),
});

export const affiliateCadastroSchema = z.object({
  statusCadastro: statusCadastroAfiliadoSchema,
  motivoRejeicao: z.string().nullable().optional(),
  permiteCorrecaoCadastro: z.boolean().nullable().optional(),
  nome: z.string(),
  email: z.string(),
  cnpj: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  razao_social: z.string().nullable().optional(),
  area_atuacao: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  rua: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  estado: z.string().nullable().optional(),
  chave_pix: z.string().nullable().optional(),
  chave_pix_tipo: z.string().nullable().optional(),
});

export const affiliateCadastroResubmitResponseSchema = z.object({
  statusCadastro: statusCadastroAfiliadoSchema,
  motivoRejeicao: z.string().nullable().optional(),
  permiteCorrecaoCadastro: z.boolean().nullable().optional(),
});

export const affiliateSaldoMesClienteDetalheSchema = z.object({
  empresaId: z.string().nullable(),
  nomeEmpresa: z.string(),
  status: z.string(),
  billingCycle: z.string().nullable(),
  valorBrutoCentavos: z.coerce.number(),
  comissaoCentavos: z.coerce.number(),
  pagamentoEm: z.string().nullable(),
});

export const affiliateSaldoMesDetalheSchema = z.object({
  periodoReferencia: z.string(),
  totalClientes: z.coerce.number(),
  valorBrutoCentavos: z.coerce.number(),
  comissaoCentavos: z.coerce.number(),
  clientes: z.array(affiliateSaldoMesClienteDetalheSchema).default([]),
});

export const affiliateRepasseHistoricoSchema = z.object({
  id: z.string(),
  status_anterior: z.string().nullable(),
  status_novo: z.string(),
  observacao: z.string().nullable().optional(),
  alterado_por_user_id: z.string().nullable().optional(),
  alterado_por_nome: z.string().nullable().optional(),
  alterado_por_tipo: z.enum(['admin', 'afiliado', 'sistema']),
  created_at: z.string(),
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
  historico_status: z.array(affiliateRepasseHistoricoSchema).optional().default([]),
});
