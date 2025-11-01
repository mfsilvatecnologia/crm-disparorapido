/**
 * Payment Validation Schemas
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Payment Status Enum Schema (Backend API)
 */
export const paymentStatusSchema = z.enum([
  'PENDING',
  'RECEIVED',
  'CONFIRMED',
  'OVERDUE',
  'REFUNDED',
  'CANCELLED',
]);

/**
 * Billing Type Enum Schema (Backend API)
 */
export const billingTypeSchema = z.enum([
  'BOLETO',
  'CREDIT_CARD',
  'PIX',
  'UNDEFINED',
]);

/**
 * Payment Entity Schema (Backend API)
 */
export const paymentSchema = z.object({
  id: z.string().min(1),
  empresaId: z.string().nullable().optional(),
  value: z.number(),
  netValue: z.number(),
  description: z.string(),
  billingType: billingTypeSchema,
  status: paymentStatusSchema,
  dueDate: z.string(), // API returns date in format YYYY-MM-DD
  paymentDate: z.string().nullable(),
  invoiceUrl: z.string().url(),
  createdAt: z.string(), // API returns date in format YYYY-MM-DD
});

/**
 * Payment List Parameters Schema (Backend API)
 */
export const paymentListParamsSchema = z.object({
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
  status: paymentStatusSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Payment List Response Schema (Backend API)
 */
export const paymentListResponseSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  data: z.array(paymentSchema),
});

/**
 * Payment Action Parameters Schema
 */
export const paymentActionParamsSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * Payment Action Response Schema
 */
export const paymentActionResponseSchema = z.object({
  success: z.boolean(),
  payment: paymentSchema,
  message: z.string().optional(),
});

/**
 * Payment Details Response Schema (Backend API)
 */
export const paymentDetailsResponseSchema = paymentSchema;

/**
 * Summary Item Schema
 */
export const summaryItemSchema = z.object({
  count: z.number().int().nonnegative(),
  amount: z.number(),
});

/**
 * Financial Summary Schema (Backend API)
 */
export const financialSummarySchema = z.object({
  totalAmountSpent: z.number(),
  payments: z.object({
    totalCount: z.number().int().nonnegative(),
    pending: summaryItemSchema,
    received: summaryItemSchema,
    overdue: summaryItemSchema,
  }),
  credits: z.object({
    currentBalance: z.number(),
    totalPurchased: z.number(),
    totalUsed: z.number(),
    amountSpentOnCredits: z.number(),
  }),
  period: z.object({
    startDate: z.string(),
    endDate: z.string(),
  }),
});

/**
 * Financial Summary Parameters Schema
 */
export const financialSummaryParamsSchema = z.object({
  period: z.enum(['last30days', 'last90days', 'currentMonth', 'allTime']).optional(),
});
