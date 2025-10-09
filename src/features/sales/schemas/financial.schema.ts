/**
 * Financial Validation Schemas
 * Zod schemas for financial summary validation
 */

import { z } from 'zod';

/**
 * Financial Summary Parameters Schema
 */
export const financialSummaryParamsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * Financial Summary Schema
 */
export const financialSummarySchema = z.object({
  totalSpent: z.number().int().nonnegative(),
  totalEarned: z.number().int().nonnegative(),
  activeSubscriptions: z.number().int().nonnegative(),
  pendingPayments: z.number().int().nonnegative(),
  period: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});
