import { apiClient } from './apiClient';
import type { StatsOverview } from '../types/enrichment';

export interface GetStatsParams {
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  providerId?: string;
}

export const getEnrichmentStats = async (params: GetStatsParams): Promise<StatsOverview> => {
  const query = new URLSearchParams();
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  if (params.providerId) query.set('providerId', params.providerId);
  const qs = query.toString();
  return apiClient.get<StatsOverview>(`/stats/enrichment${qs ? '?' + qs : ''}`);
};
