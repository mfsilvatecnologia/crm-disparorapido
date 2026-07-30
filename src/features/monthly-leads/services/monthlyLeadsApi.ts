import { apiClient } from '@/lib/api-client';
import type {
  ClaimResult,
  DeliveredLeadsResponse,
  LeadAllocationCycle,
  LeadDeliveryHistoryItem,
  LeadExportFormat,
  LeadPreference,
  MonthlyLeadCatalogResponse,
} from '../types/monthlyLeads.types';

interface ApiSuccess<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const monthlyLeadsApi = {
  async getCatalog(): Promise<MonthlyLeadCatalogResponse> {
    const response = await apiClient.get<ApiSuccess<MonthlyLeadCatalogResponse>>('/api/v1/monthly-leads/catalog');
    return response.data;
  },

  async getPreference(): Promise<LeadPreference | null> {
    const response = await apiClient.get<ApiSuccess<LeadPreference | null>>('/api/v1/monthly-leads/preference');
    return response.data;
  },

  async savePreference(estado: string, segmento: string): Promise<LeadPreference> {
    const response = await apiClient.put<ApiSuccess<LeadPreference>>('/api/v1/monthly-leads/preference', {
      estado,
      segmento,
    });
    return response.data;
  },

  async getCycle(): Promise<LeadAllocationCycle> {
    const response = await apiClient.get<ApiSuccess<LeadAllocationCycle>>('/api/v1/monthly-leads/cycle');
    return response.data;
  },

  async claim(quantidade?: number): Promise<ClaimResult> {
    // Claim may allocate in multiple batches against Leads API; allow longer than the default 30s.
    const response = await apiClient.post<ApiSuccess<ClaimResult>>(
      '/api/v1/monthly-leads/claim',
      { quantidade },
      { timeout: 180000 }
    );
    return response.data;
  },

  async getHistory(page = 1, limit = 10): Promise<LeadDeliveryHistoryItem[]> {
    const response = await apiClient.get<ApiSuccess<LeadDeliveryHistoryItem[]>>('/api/v1/monthly-leads/history', {
      params: { page, limit },
    });
    return response.data;
  },

  async getDeliveredLeads(page = 1, limit = 20, requestId?: string): Promise<DeliveredLeadsResponse> {
    const response = await apiClient.get<ApiSuccess<DeliveredLeadsResponse>>('/api/v1/monthly-leads/delivered', {
      params: { page, limit, requestId },
    });
    return response.data;
  },

  async downloadDeliveredExport(format: LeadExportFormat, requestId?: string): Promise<void> {
    const response = await apiClient.getClient().get('/api/v1/monthly-leads/delivered/export', {
      params: { format, requestId },
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] as string | undefined;
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] ?? `leads_${format}.csv`;

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
