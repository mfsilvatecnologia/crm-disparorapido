import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

const subscriptionSummarySchema = z.object({
  id: z.string(),
  status: z.string(),
  billingCycle: z.string(),
  billingType: z.string().nullable(),
  value: z.coerce.number(),
  createdAt: z.string(),
  nextDueDate: z.string(),
  asaasSubscriptionId: z.string(),
  hasOpenInvoice: z.boolean(),
  produtoId: z.string(),
});

const affiliateAttributionSchema = z
  .object({
    afiliadoId: z.string(),
    afiliadoNome: z.string(),
    afiliadoRefSlug: z.string(),
  })
  .nullable();

const adminClientListItemSchema = z.object({
  userId: z.string(),
  empresaId: z.string(),
  nome: z.string(),
  email: z.string(),
  cpfCnpj: z.string(),
  telefone: z.string().nullable(),
  empresaNome: z.string(),
  empresaCnpj: z.string().nullable(),
  planoAtual: z.string().nullable(),
  statusEmpresa: z.string().nullable(),
  emailConfirmedAt: z.string().nullable(),
  userStatus: z.string(),
  empresaCreatedAt: z.string(),
  subscription: subscriptionSummarySchema.nullable(),
  affiliateAttribution: affiliateAttributionSchema.default(null),
});

const adminClientListResponseSchema = z.object({
  items: z.array(adminClientListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const adminClientDetailSchema = adminClientListItemSchema.extend({
  subscriptions: z.array(subscriptionSummarySchema),
});

export type AdminClientListItem = z.infer<typeof adminClientListItemSchema>;
export type AdminClientListResponse = z.infer<typeof adminClientListResponseSchema>;
export type AdminClientDetail = z.infer<typeof adminClientDetailSchema>;

export type UpdateAdminClientInput = {
  empresaNome?: string;
  empresaCnpj?: string;
  cpfCnpj?: string;
  telefone?: string | null;
};

export type AdminClientFilters = {
  page?: number;
  limit?: number;
  nome?: string;
  email?: string;
  telefone?: string;
  cnpj?: string;
  cpf?: string;
  plano?: string;
  billingType?: string;
  createdFrom?: string;
  createdTo?: string;
  subscriptionCreatedFrom?: string;
  subscriptionCreatedTo?: string;
  dueFrom?: string;
  dueTo?: string;
  emailConfirmed?: boolean;
  hasOpenInvoice?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function adminListClients(filters?: AdminClientFilters): Promise<AdminClientListResponse> {
  const raw = await apiClient.get<unknown>('/api/v1/admin/clients', { params: filters });
  return adminClientListResponseSchema.parse(unwrapData(raw));
}

export async function adminGetClient(empresaId: string): Promise<AdminClientDetail> {
  const raw = await apiClient.get<unknown>(`/api/v1/admin/clients/${encodeURIComponent(empresaId)}`);
  return adminClientDetailSchema.parse(unwrapData(raw));
}

export async function adminConfirmClientEmail(userId: string): Promise<{ success: boolean; message: string }> {
  const raw = await apiClient.post<unknown>(`/api/v1/admin/clients/${encodeURIComponent(userId)}/confirm-email`);
  return z.object({ success: z.boolean(), message: z.string() }).parse(unwrapData(raw));
}

export async function adminResendClientConfirmationEmail(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const raw = await apiClient.post<unknown>(
    `/api/v1/admin/clients/${encodeURIComponent(userId)}/resend-confirmation-email`
  );
  return z.object({ success: z.boolean(), message: z.string() }).parse(unwrapData(raw));
}

export async function adminDispatchClientWebhook(
  empresaId: string,
  body: { eventType: string; customPayload?: Record<string, unknown> }
): Promise<{ success: boolean; responseStatus: number | null }> {
  const raw = await apiClient.post<unknown>(
    `/api/v1/admin/clients/${encodeURIComponent(empresaId)}/dispatch-webhook`,
    body
  );
  return z
    .object({ success: z.boolean(), responseStatus: z.number().nullable() })
    .parse(unwrapData(raw));
}

export async function adminUpdateClient(
  empresaId: string,
  body: UpdateAdminClientInput
): Promise<AdminClientDetail> {
  const raw = await apiClient.patch<unknown>(
    `/api/v1/admin/clients/${encodeURIComponent(empresaId)}`,
    body
  );
  return adminClientDetailSchema.parse(unwrapData(raw));
}

export const adminClientsApi = {
  listClients: adminListClients,
  getClient: adminGetClient,
  updateClient: adminUpdateClient,
  confirmEmail: adminConfirmClientEmail,
  resendConfirmationEmail: adminResendClientConfirmationEmail,
  dispatchWebhook: adminDispatchClientWebhook,
};
