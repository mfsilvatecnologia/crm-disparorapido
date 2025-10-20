/**
 * Credit Validation Schemas
 * Zod schemas for runtime validation of credit transactions
 */

import { z } from 'zod';

/**
 * Credit Transaction Type Enum Schema (Backend API)
 */
export const creditTransactionTypeSchema = z.enum([
  'compra',
  'uso',
  'reembolso',
  'bonus',
]);

/**
 * Credit Transaction Entity Schema (Backend API)
 */
export const creditTransactionSchema = z.object({
  id: z.string().min(1),
  empresaId: z.string(),
  type: creditTransactionTypeSchema,
  quantity: z.number(),
  previousBalance: z.number(),
  newBalance: z.number(),
  amountPaid: z.number().nullable(),
  paymentId: z.string().nullable(),
  lead: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  description: z.string(),
  createdAt: z.string().datetime(),
});

/**
 * Credit Transaction List Parameters Schema (Backend API)
 */
export const creditTransactionListParamsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  type: creditTransactionTypeSchema.optional(),
});

/**
 * Credit Transaction List Response Schema (Backend API)
 */
export const creditTransactionListResponseSchema = z.array(creditTransactionSchema);

/**
 * Credit Balance Schema
 * For /api/v1/credits/balance endpoint
 */
export const creditBalanceSchema = z.object({
  empresaId: z.string(),
  empresaNome: z.string(),
  saldoCreditosCentavos: z.number(),
  saldoFormatado: z.string(),
  estatisticas: z.object({
    totalComprado: z.number(),
    totalGasto: z.number(),
    totalBonusRecebido: z.number(),
  }),
});

/**
 * Credit Balance Response Schema
 * Wrapper for credit balance response
 */
export const creditBalanceResponseSchema = z.object({
  data: creditBalanceSchema,
});

/**
 * Credit Package Schema
 * For /api/v1/credits/packages endpoint
 */
export const creditPackageSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string().nullable().optional(),
  preco_centavos: z.number(),
  precoFormatado: z.string(),
  quantidade_creditos: z.number(),
  bonus_creditos: z.number(),
  leadsInclusos: z.number().optional(),
  bonusLeads: z.number().nullable().optional(),
  custoPorLead: z.string().optional(),
  ativo: z.boolean(),
  destaque: z.boolean(),
  economia: z.string().nullable().optional(),
  metadata: z.object({
    creditos_total: z.number().optional(),
    custo_por_credito: z.number().optional(),
  }).optional(),
});
