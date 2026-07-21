import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const reportCategorySchema = z.enum([
  'plano_mensal',
  'plano_anual',
  'teste_gratis_mensal',
  'teste_gratis_anual',
  'assinaturas_canceladas',
  'teste_gratis_cancelados',
]);

const reportRowSchema = z.object({
  category: reportCategorySchema,
  label: z.string(),
  quantity: z.number(),
  value: z.number(),
  pix: z.number(),
  card: z.number(),
});

const timelinePointSchema = z.object({
  date: z.string(),
  monthly: z.number(),
  yearly: z.number(),
  canceled: z.number(),
  total: z.number(),
});

const newSubscriptionsReportSchema = z.object({
  period: z.object({ startDate: z.string(), endDate: z.string() }),
  rows: z.array(reportRowSchema),
  totals: z.object({
    quantity: z.number(),
    value: z.number(),
    pix: z.number(),
    card: z.number(),
  }),
  timeline: z.array(timelinePointSchema),
});

export type AdminNewSubscriptionsReport = z.infer<typeof newSubscriptionsReportSchema>;
export type AdminNewSubscriptionReportRow = z.infer<typeof reportRowSchema>;
export type AdminNewSubscriptionReportCategory = z.infer<typeof reportCategorySchema>;
export type AdminNewSubscriptionTimelinePoint = z.infer<typeof timelinePointSchema>;

export async function adminGetNewSubscriptionsReport(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<AdminNewSubscriptionsReport> {
  const raw = await apiClient.get<unknown>('/api/v1/admin/reports/new-subscriptions', { params });
  return newSubscriptionsReportSchema.parse(unwrapData(raw));
}

export const adminReportsApi = {
  getNewSubscriptionsReport: adminGetNewSubscriptionsReport,
};
