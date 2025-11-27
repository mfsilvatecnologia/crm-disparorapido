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
  comissaoPadraoTipo: z.enum(['percentual', 'fixo']),
  comissaoPadraoValor: z.number(),
  ativo: z.boolean(),
  linkIndicacao: z.string(),
});

export const commissionSummarySchema = z.object({
  id: z.string(),
  tipoOrigem: commissionOriginTypeSchema,
  comissaoCreditos: z.number(),
  status: commissionStatusSchema,
  createdAt: z.string(),
});

export const affiliateStatisticsSchema = z.object({
  codigoAfiliado: z.string(),
  totalIndicacoes: z.number(),
  totalComissoesCreditos: z.number(),
  totalValorGeradoCentavos: z.number(),
  ativo: z.boolean(),
  createdAt: z.string(),
  ultimasComissoes: z.array(commissionSummarySchema).default([]),
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
