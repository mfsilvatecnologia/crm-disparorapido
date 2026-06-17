import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const financialSummarySchema = z.object({
  activeSubscriptions: z.number(),
  trialingSubscriptions: z.number(),
  canceledSubscriptions: z.number(),
  pastDueSubscriptions: z.number(),
  estimatedMrr: z.number(),
  dueNext7Days: z.number(),
  dueNext30Days: z.number(),
  newSubscriptionsInPeriod: z.number(),
  period: z.object({ startDate: z.string(), endDate: z.string() }),
});

const paymentCategorySchema = z.enum(['SUBSCRIPTION', 'EXTENSION', 'LEADS', 'OTHER']);

const paymentItemSchema = z.object({
  id: z.string(),
  empresaId: z.string().nullable().optional(),
  empresaNome: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  category: paymentCategorySchema,
  value: z.coerce.number(),
  netValue: z.coerce.number(),
  description: z.string(),
  billingType: z.string(),
  status: z.string(),
  dueDate: z.string(),
  paymentDate: z.string().nullable(),
  invoiceUrl: z.string(),
  createdAt: z.string(),
});

const pageSummarySchema = z.object({
  count: z.number(),
  totalValue: z.number(),
  confirmedValue: z.number(),
  byCategory: z.object({
    SUBSCRIPTION: z.object({ count: z.number(), value: z.number() }),
    EXTENSION: z.object({ count: z.number(), value: z.number() }),
    LEADS: z.object({ count: z.number(), value: z.number() }),
    OTHER: z.object({ count: z.number(), value: z.number() }),
  }),
});

const paymentListSchema = z.object({
  totalCount: z.number(),
  limit: z.number(),
  offset: z.number(),
  data: z.array(paymentItemSchema),
  pageSummary: pageSummarySchema,
});

export type AdminFinancialSummary = z.infer<typeof financialSummarySchema>;
export type AdminPaymentList = z.infer<typeof paymentListSchema>;
export type AdminPaymentCategory = z.infer<typeof paymentCategorySchema>;
export type AdminPaymentItem = z.infer<typeof paymentItemSchema>;

export async function adminGetFinancialSummary(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AdminFinancialSummary> {
  const raw = await apiClient.get<unknown>('/api/v1/admin/financial/summary', { params });
  return financialSummarySchema.parse(unwrapData(raw));
}

export async function adminListFinancialPayments(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  empresaId?: string;
  category?: AdminPaymentCategory;
}): Promise<AdminPaymentList> {
  const raw = await apiClient.get<unknown>('/api/v1/admin/financial/payments', { params });
  return paymentListSchema.parse(unwrapData(raw));
}

export const adminFinancialApi = {
  getSummary: adminGetFinancialSummary,
  listPayments: adminListFinancialPayments,
};
