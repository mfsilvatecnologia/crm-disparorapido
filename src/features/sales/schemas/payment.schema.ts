/**
 * Payment Validation Schemas
 * 
 * Zod schemas for payment history validation
 */

import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from '../types';

/**
 * Payment status schema
 */
export const paymentStatusSchema = z.nativeEnum(PaymentStatus);

/**
 * Payment method schema
 */
export const paymentMethodSchema = z.nativeEnum(PaymentMethod);

/**
 * Payment history schema
 */
export const paymentHistorySchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  assinaturaId: z.string().uuid('ID da assinatura deve ser um UUID válido'),
  
  valorCentavos: z.number()
    .int('Valor deve ser inteiro')
    .min(0, 'Valor não pode ser negativo')
    .max(1000000, 'Valor muito alto'),
  
  status: paymentStatusSchema,
  
  paymentMethod: paymentMethodSchema,
  
  dueDate: z.string().datetime('Data de vencimento inválida'),
  
  paidAt: z.string()
    .datetime('Data de pagamento inválida')
    .nullable(),
  
  asaasPaymentId: z.string()
    .min(1, 'ID do pagamento Asaas inválido')
    .nullable(),
  
  invoiceUrl: z.string()
    .url('URL da fatura inválida')
    .nullable(),
  
  boletoBarcode: z.string()
    .min(44, 'Código de barras deve ter 44 dígitos')
    .max(48, 'Código de barras deve ter no máximo 48 dígitos')
    .nullable(),
  
  pixQrCode: z.string()
    .min(1, 'QR Code PIX inválido')
    .nullable(),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  
  updatedAt: z.string().datetime('Data de atualização inválida')
}).refine(
  (data) => {
    // Se status for CONFIRMED ou RECEIVED, deve ter paidAt
    if (data.status === PaymentStatus.CONFIRMED || data.status === PaymentStatus.RECEIVED) {
      return data.paidAt !== null;
    }
    return true;
  },
  {
    message: 'Pagamento confirmado ou recebido deve ter data de pagamento',
    path: ['paidAt']
  }
).refine(
  (data) => {
    // Se método for BOLETO, deve ter boletoBarcode
    if (data.paymentMethod === PaymentMethod.BOLETO && data.status === PaymentStatus.PENDING) {
      return data.boletoBarcode !== null;
    }
    return true;
  },
  {
    message: 'Pagamento por boleto deve ter código de barras',
    path: ['boletoBarcode']
  }
).refine(
  (data) => {
    // Se método for PIX, deve ter pixQrCode
    if (data.paymentMethod === PaymentMethod.PIX && data.status === PaymentStatus.PENDING) {
      return data.pixQrCode !== null;
    }
    return true;
  },
  {
    message: 'Pagamento por PIX deve ter QR Code',
    path: ['pixQrCode']
  }
);

/**
 * Payment history array schema
 */
export const paymentHistoriesSchema = z.array(paymentHistorySchema);

/**
 * Payment filters schema
 */
export const paymentFiltersSchema = z.object({
  assinaturaId: z.string().uuid().optional(),
  
  status: z.array(paymentStatusSchema).optional(),
  
  paymentMethod: z.array(paymentMethodSchema).optional(),
  
  dataInicio: z.string().datetime().optional(),
  
  dataFim: z.string().datetime().optional(),
  
  page: z.number().int().min(1).default(1),
  
  limit: z.number().int().min(1).max(100).default(20)
});

/**
 * Retry payment DTO schema
 */
export const retryPaymentSchema = z.object({
  paymentMethod: paymentMethodSchema.optional(),
  
  creditCardToken: z.string()
    .min(1, 'Token do cartão é obrigatório')
    .optional()
});

/**
 * Helper to validate payment history
 */
export function validatePaymentHistory(data: unknown) {
  return paymentHistorySchema.safeParse(data);
}

/**
 * Helper to validate payment histories array
 */
export function validatePaymentHistories(data: unknown) {
  return paymentHistoriesSchema.safeParse(data);
}

/**
 * Helper to validate payment filters
 */
export function validatePaymentFilters(data: unknown) {
  return paymentFiltersSchema.safeParse(data);
}

/**
 * Helper to validate retry payment
 */
export function validateRetryPayment(data: unknown) {
  return retryPaymentSchema.safeParse(data);
}

/**
 * Type inference
 */
export type PaymentHistorySchema = z.infer<typeof paymentHistorySchema>;
export type PaymentFiltersSchema = z.infer<typeof paymentFiltersSchema>;
export type RetryPaymentSchema = z.infer<typeof retryPaymentSchema>;
