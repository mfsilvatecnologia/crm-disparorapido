/**
 * Payment Validation Schemas
 * Zod schemas for runtime validation
 */

import { z } from 'zod';

/**
 * Payment Status Enum Schema
 */
export const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'cancelled',
  'refunded',
]);

/**
 * Payment Method Enum Schema
 */
export const paymentMethodSchema = z.enum([
  'credit_card',
  'pix',
  'boleto',
]);

/**
 * Payment Entity Schema
 */
export const paymentSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  status: paymentStatusSchema,
  method: paymentMethodSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  description: z.string().min(1),
  subscriptionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Payment List Parameters Schema
 */
export const paymentListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  status: paymentStatusSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Pagination Metadata Schema
 */
export const paginationMetaSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalItems: z.number().int().nonnegative(),
  itemsPerPage: z.number().int().positive(),
});

/**
 * Payment List Response Schema
 */
export const paymentListResponseSchema = z.object({
  payments: z.array(paymentSchema),
  pagination: paginationMetaSchema,
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
 * Payment Details Response Schema
 */
export const paymentDetailsResponseSchema = paymentSchema.extend({
  transactionId: z.string().optional(),
  receiptUrl: z.string().url().optional(),
});
