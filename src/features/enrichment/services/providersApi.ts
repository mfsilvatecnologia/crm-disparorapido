import { apiClient } from './apiClient';
import type { Provider } from '../types/enrichment';

export interface UpdateProviderPayload {
  enabled?: boolean;
  priority?: number;
  rateLimitPerMin?: number;
}

export const listProviders = async (): Promise<Provider[]> => {
  return apiClient.get<Provider[]>('/providers');
};

export const updateProvider = async (
  id: string,
  payload: UpdateProviderPayload
): Promise<Provider> => {
  return apiClient.patch<Provider, UpdateProviderPayload>(`/providers/${id}`, payload);
};
