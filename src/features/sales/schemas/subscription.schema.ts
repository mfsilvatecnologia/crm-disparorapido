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
 * Subscription schema - alinhado ao SubscriptionResponseDTO da API (lista, restore, etc.)
 * Ref: resposta da API de assinaturas (GET/POST restore, etc.)
 */
export const subscriptionSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  empresaId: z.string().min(1),
  produtoId: z.string().min(1),
  asaasSubscriptionId: z.string().nullable(),
  asaasInvoiceUrl: z.string().url().nullable().optional(),
  status: z.string().min(1), // API pode retornar active, trialing, canceled, past_due, pending_payment_method, etc.
  billingCycle: z.string().optional(),
  billingCycleDescription: z.string().optional(),
  value: z.number().optional(),
  valueFormatted: z.string().optional(),
  hasTrial: z.boolean().optional(),
  trialDays: z.number().int().nullable().optional(),
  trialEndDate: z.string().nullable().optional(),
  isInTrial: z.boolean().optional(),
  nextDueDate: z.string().nullable().optional(),
  firstPaymentDate: z.string().nullable().optional(),
  lastPaymentDate: z.string().nullable().optional(),
  maxPayments: z.number().int().nullable().optional(),
  paymentsCount: z.number().int().optional(),
  remainingPayments: z.number().int().nullable().optional(),
  description: z.string().nullable().optional(),
  externalReference: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  canceledAt: z.string().nullable().optional(),
  suspendedAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  firstChargeDate: z.string().optional(),
  nextSteps: z.array(z.string()).optional(),
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
  reason: z.string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .optional(),
  
  cancelInAsaas: z.boolean()
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
