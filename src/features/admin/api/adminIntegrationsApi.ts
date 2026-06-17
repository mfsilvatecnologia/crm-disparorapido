import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const n8nSettingsSchema = z.object({
  webhookUrl: z.string(),
  webhookSecret: z.string().nullable(),
  enabled: z.boolean(),
  hasSecret: z.boolean(),
});

const dispatchLogSchema = z.object({
  id: z.string(),
  empresaId: z.string().nullable(),
  eventType: z.string(),
  webhookUrl: z.string(),
  requestPayload: z.record(z.unknown()),
  responseStatus: z.number().nullable(),
  responseBody: z.string().nullable(),
  triggeredByUserId: z.string().nullable(),
  createdAt: z.string(),
});

const dispatchListSchema = z.object({
  items: z.array(dispatchLogSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type N8nIntegrationSettings = z.infer<typeof n8nSettingsSchema>;
export type AdminWebhookDispatchLog = z.infer<typeof dispatchLogSchema>;

export async function adminGetN8nSettings(): Promise<N8nIntegrationSettings> {
  const raw = await apiClient.get<unknown>('/api/v1/admin/integrations/n8n');
  return n8nSettingsSchema.parse(unwrapData(raw));
}

export async function adminUpdateN8nSettings(body: {
  webhookUrl: string;
  webhookSecret?: string | null;
  enabled: boolean;
}): Promise<N8nIntegrationSettings> {
  const raw = await apiClient.put<unknown>('/api/v1/admin/integrations/n8n', body);
  return n8nSettingsSchema.parse(unwrapData(raw));
}

export async function adminTestN8nWebhook(body?: {
  webhookUrl?: string;
  webhookSecret?: string | null;
}): Promise<{ success: boolean; responseStatus: number | null }> {
  const raw = await apiClient.post<unknown>('/api/v1/admin/integrations/n8n/test', body ?? {});
  return z
    .object({ success: z.boolean(), responseStatus: z.number().nullable() })
    .parse(unwrapData(raw));
}

export async function adminListWebhookDispatches(params?: {
  page?: number;
  limit?: number;
  empresaId?: string;
  eventType?: string;
}) {
  const raw = await apiClient.get<unknown>('/api/v1/admin/webhook-dispatches', { params });
  return dispatchListSchema.parse(unwrapData(raw));
}

export const adminIntegrationsApi = {
  getN8nSettings: adminGetN8nSettings,
  updateN8nSettings: adminUpdateN8nSettings,
  testN8nWebhook: adminTestN8nWebhook,
  listWebhookDispatches: adminListWebhookDispatches,
};
