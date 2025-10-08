/**
 * Credit Validation Schemas
 * 
 * Zod schemas for credit system validation
 */

import { z } from 'zod';
import { CreditTransactionType } from '../types';

/**
 * Credit transaction type schema
 */
export const creditTransactionTypeSchema = z.nativeEnum(CreditTransactionType);

/**
 * Credit transaction schema
 */
export const creditTransactionSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  empresaId: z.string().uuid('ID da empresa deve ser um UUID válido'),
  
  tipo: creditTransactionTypeSchema,
  
  quantidade: z.number()
    .int('Quantidade deve ser inteiro')
    .refine(
      (val) => val !== 0,
      'Quantidade não pode ser zero'
    ),
  
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  produtoId: z.string()
    .uuid('ID do produto deve ser um UUID válido')
    .nullable(),
  
  leadId: z.string()
    .uuid('ID do lead deve ser um UUID válido')
    .nullable(),
  
  saldoApos: z.number()
    .int('Saldo deve ser inteiro')
    .min(0, 'Saldo não pode ser negativo'),
  
  dataHora: z.string().datetime('Data/hora inválida'),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  
  updatedAt: z.string().datetime('Data de atualização inválida')
}).refine(
  (data) => {
    // COMPRA e BONUS devem ser positivos
    if (data.tipo === CreditTransactionType.COMPRA || data.tipo === CreditTransactionType.BONUS || data.tipo === CreditTransactionType.REEMBOLSO) {
      return data.quantidade > 0;
    }
    // USO deve ser negativo
    if (data.tipo === CreditTransactionType.USO) {
      return data.quantidade < 0;
    }
    return true;
  },
  {
    message: 'Quantidade inválida para o tipo de transação',
    path: ['quantidade']
  }
).refine(
  (data) => {
    // COMPRA deve ter produtoId
    if (data.tipo === CreditTransactionType.COMPRA) {
      return data.produtoId !== null;
    }
    return true;
  },
  {
    message: 'Compra de créditos deve estar associada a um produto',
    path: ['produtoId']
  }
).refine(
  (data) => {
    // USO deve ter leadId
    if (data.tipo === CreditTransactionType.USO) {
      return data.leadId !== null;
    }
    return true;
  },
  {
    message: 'Uso de créditos deve estar associado a um lead',
    path: ['leadId']
  }
);

/**
 * Credit transactions array schema
 */
export const creditTransactionsSchema = z.array(creditTransactionSchema);

/**
 * Credit balance schema
 */
export const creditBalanceSchema = z.object({
  empresaId: z.string().uuid('ID da empresa deve ser um UUID válido'),
  
  empresaNome: z.string().min(1, 'Nome da empresa é obrigatório'),
  
  saldoCreditosCentavos: z.number()
    .int('Saldo deve ser inteiro')
    .min(0, 'Saldo não pode ser negativo'),
  
  saldoFormatado: z.string(),
  
  // Backward compatibility fields (optional)
  saldoAtual: z.number()
    .int('Saldo deve ser inteiro')
    .min(0, 'Saldo não pode ser negativo')
    .optional(),
  
  totalComprado: z.number()
    .int('Total comprado deve ser inteiro')
    .min(0, 'Total comprado não pode ser negativo')
    .optional(),
  
  totalGasto: z.number()
    .int('Total gasto deve ser inteiro')
    .min(0, 'Total gasto não pode ser negativo')
    .optional(),
  
  totalBonus: z.number()
    .int('Total bonus deve ser inteiro')
    .min(0, 'Total bonus não pode ser negativo')
    .optional(),
  
  totalReembolsado: z.number()
    .int('Total reembolsado deve ser inteiro')
    .min(0, 'Total reembolsado não pode ser negativo')
    .optional(),
  
  ultimaTransacao: creditTransactionSchema.nullable().optional(),
  
  estatisticas: z.object({
    totalComprado: z.number()
      .int('Total comprado deve ser inteiro')
      .min(0, 'Total comprado não pode ser negativo'),
    
    totalGasto: z.number()
      .int('Total gasto deve ser inteiro')
      .min(0, 'Total gasto não pode ser negativo'),
    
    totalBonusRecebido: z.number()
      .int('Total bonus recebido deve ser inteiro')
      .min(0, 'Total bonus recebido não pode ser negativo'),
    
    // Computed fields (optional)
    leadsComprados: z.number()
      .int('Leads comprados deve ser inteiro')
      .min(0, 'Não pode ser negativo')
      .optional(),
    
    creditoMedioPorLead: z.number()
      .min(0, 'Crédito médio não pode ser negativo')
      .optional(),
    
    leadsEstimados: z.number()
      .int('Leads estimados deve ser inteiro')
      .min(0, 'Não pode ser negativo')
      .optional()
  })
});

/**
 * Credit package schema
 */
export const creditPackageSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  preco: z.number()
    .min(0, 'Preço não pode ser negativo')
    .max(1000000, 'Preço muito alto'),
  
  precoFormatado: z.string()
    .min(1, 'Preço formatado é obrigatório'),
  
  quantidade_creditos: z.number()
    .int('Quantidade de créditos deve ser inteiro')
    .min(1, 'Mínimo de 1 crédito'),
  
  bonus_creditos: z.number()
    .int('Bônus de créditos deve ser inteiro')
    .min(0, 'Bônus não pode ser negativo'),
  
  ativo: z.boolean(),
  
  destaque: z.boolean(),
  
  metadata: z.object({
    creditos_bonus: z.number().int().min(0),
    creditos_total: z.number().int().min(0).optional(),
    custo_por_credito: z.number().min(0),
    validade_creditos: z.string(),
    quantidade_creditos: z.number().int().min(1),
  }),
  
  // Backward compatibility fields (optional)
  creditos: z.number().int().min(1).optional(),
  bonusPercentual: z.number().min(0).max(100).optional(),
  creditosTotal: z.number().int().min(1).optional(),
  ordem: z.number().int().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

/**
 * Credit packages array schema
 */
export const creditPackagesSchema = z.array(creditPackageSchema);

/**
 * Purchase credit package DTO schema
 */
export const purchaseCreditPackageSchema = z.object({
  pacoteId: z.string().uuid('ID do pacote deve ser um UUID válido'),
  
  paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  
  creditCardToken: z.string()
    .min(1, 'Token do cartão é obrigatório')
    .optional()
});

/**
 * Purchase lead with credits DTO schema
 */
export const purchaseLeadSchema = z.object({
  leadId: z.string().uuid('ID do lead deve ser um UUID válido')
});

/**
 * Credit transaction filters schema
 */
export const creditTransactionFiltersSchema = z.object({
  tipo: z.array(creditTransactionTypeSchema).optional(),
  
  dataInicio: z.string().datetime().optional(),
  
  dataFim: z.string().datetime().optional(),
  
  page: z.number().int().min(1).default(1),
  
  limit: z.number().int().min(1).max(100).default(20)
});

/**
 * Helper to validate credit transaction
 */
export function validateCreditTransaction(data: unknown) {
  return creditTransactionSchema.safeParse(data);
}

/**
 * Helper to validate credit balance
 */
export function validateCreditBalance(data: unknown) {
  return creditBalanceSchema.safeParse(data);
}

/**
 * Helper to validate credit package
 */
export function validateCreditPackage(data: unknown) {
  return creditPackageSchema.safeParse(data);
}

/**
 * Helper to validate purchase credit package
 */
export function validatePurchaseCreditPackage(data: unknown) {
  return purchaseCreditPackageSchema.safeParse(data);
}

/**
 * Helper to validate purchase lead
 */
export function validatePurchaseLead(data: unknown) {
  return purchaseLeadSchema.safeParse(data);
}

/**
 * Type inference
 */
export type CreditTransactionSchema = z.infer<typeof creditTransactionSchema>;
export type CreditBalanceSchema = z.infer<typeof creditBalanceSchema>;
export type CreditPackageSchema = z.infer<typeof creditPackageSchema>;
export type PurchaseCreditPackageSchema = z.infer<typeof purchaseCreditPackageSchema>;
export type PurchaseLeadSchema = z.infer<typeof purchaseLeadSchema>;
export type CreditTransactionFiltersSchema = z.infer<typeof creditTransactionFiltersSchema>;
