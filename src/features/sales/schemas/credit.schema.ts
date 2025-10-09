/**
 * Credit Validation Schemas
 * Zod schemas for credit transaction validation
 */

import { z } from 'zod';
import { paginationMetaSchema } from './payment.schema';

/**
 * Credit Transaction Type Enum Schema
 */
export const creditTransactionTypeSchema = z.enum([
  'earned',
  'spent',
  'bonus',
  'refund',
]);

/**
 * Related Entity Type Enum Schema
 */
export const relatedEntityTypeSchema = z.enum([
  'payment',
  'subscription',
  'campaign',
]);

/**
 * Credit Transaction Entity Schema
 */
export const creditTransactionSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int(), // Can be negative for spent credits
  type: creditTransactionTypeSchema,
  description: z.string().min(1),
  createdAt: z.string().datetime(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
  relatedEntityId: z.string().optional(),
  balanceAfter: z.number().int().nonnegative(),
});

/**
 * Credit Transaction List Parameters Schema
 */
export const creditTransactionListParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  type: creditTransactionTypeSchema.optional(),
});

/**
 * Credit Transaction List Response Schema
 */
export const creditTransactionListResponseSchema = z.object({
  transactions: z.array(creditTransactionSchema),
  pagination: paginationMetaSchema,
});

/**
 * Credit Balance Schema
 */
export const creditBalanceSchema = z.object({
  balance: z.number().int().nonnegative(),
  lastUpdated: z.string().datetime(),
});
