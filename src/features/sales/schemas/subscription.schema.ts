/**
 * Subscription Validation Schemas
 * 
 * Zod schemas for subscription validation
 */

import { z } from 'zod';
import { SubscriptionStatus, BillingCycle } from '../types';

/**
 * Subscription status schema
 */
export const subscriptionStatusSchema = z.nativeEnum(SubscriptionStatus);

/**
 * Subscription schema
 */
export const subscriptionSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  // New API fields
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  produtoId: z.string().uuid('ID do produto deve ser um UUID válido'),
  dataInicio: z.string().datetime('Data de início inválida'),
  dataExpiracao: z.string().datetime('Data de expiração inválida'),
  status: z.enum(['trial', 'trialing', 'ativa', 'active', 'expirada', 'cancelada', 'suspensa']),
  tipo: z.enum(['trial', 'paga', 'vitalicia']),
  valorPago: z.number().nullable(),
  asaasPaymentId: z.string().nullable(),
  diaCobranca: z.number().int().nullable(),
  diasRestantes: z.number().int(),
  isActive: z.boolean(),
  isExpirando: z.boolean(),
  descricaoStatus: z.string(),
  
  // New trial fields from API
  asaasInvoiceUrl: z.string().url().nullable().optional(),
  trialDays: z.number().int().positive().optional(),
  trialEndDate: z.string().optional(),
  firstChargeDate: z.string().optional(),
  nextSteps: z.array(z.string()).optional(),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  updatedAt: z.string().datetime('Data de atualização inválida'),
  
  // Backward compatibility fields (optional)
  empresaId: z.string().uuid().optional(),
  companyId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  trialStart: z.string().datetime().nullable().optional(),
  trialEnd: z.string().datetime().nullable().optional(),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  nextDueDate: z.string().datetime().nullable().optional(),
  valorCentavos: z.number().int().min(0).optional(),
  amount: z.number().int().min(0).optional(),
  billingCycle: z.nativeEnum(BillingCycle).optional(),
  asaasSubscriptionId: z.string().nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  canceledAt: z.string().datetime().nullable().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
});

/**
 * Trial subscription response schema (from API)
 */
export const trialSubscriptionResponseSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  status: z.enum(['trial', 'trialing', 'ativa', 'active', 'expirada', 'cancelada', 'suspensa']),
  asaasInvoiceUrl: z.string().url().nullable().optional(),
  trialDays: z.number().int().positive().optional(),
  trialEndDate: z.string().optional(),
  firstChargeDate: z.string().optional(),
  nextSteps: z.array(z.string()).optional(),
});

/**
 * Subscription array schema
 */
export const subscriptionsSchema = z.array(subscriptionSchema);

/**
 * Create Subscription DTO schema
 */
export const createSubscriptionSchema = z.object({
  produtoId: z.string().uuid('ID do produto deve ser um UUID válido'),
  
  paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  })
});

/**
 * Cancel Subscription DTO schema
 */
export const cancelSubscriptionSchema = z.object({
  motivo: z.string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .optional(),
  
  cancelarImediatamente: z.boolean()
    .default(false)
});

/**
 * Update Payment Method DTO schema
 */
export const updatePaymentMethodSchema = z.object({
  paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' })
  }),
  
  creditCardToken: z.string()
    .min(1, 'Token do cartão é obrigatório')
    .optional()
});

/**
 * Helper to validate subscription
 */
export function validateSubscription(data: unknown) {
  return subscriptionSchema.safeParse(data);
}

/**
 * Helper to validate trial subscription response
 */
export function validateTrialSubscription(data: unknown) {
  return trialSubscriptionResponseSchema.safeParse(data);
}

/**
 * Helper to validate subscriptions array
 */
export function validateSubscriptions(data: unknown) {
  return subscriptionsSchema.safeParse(data);
}

/**
 * Helper to validate create subscription
 */
export function validateCreateSubscription(data: unknown) {
  return createSubscriptionSchema.safeParse(data);
}

/**
 * Helper to validate cancel subscription
 */
export function validateCancelSubscription(data: unknown) {
  return cancelSubscriptionSchema.safeParse(data);
}

/**
 * Type inference
 */
export type SubscriptionSchema = z.infer<typeof subscriptionSchema>;
export type CreateSubscriptionSchema = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionSchema = z.infer<typeof cancelSubscriptionSchema>;
export type UpdatePaymentMethodSchema = z.infer<typeof updatePaymentMethodSchema>;
