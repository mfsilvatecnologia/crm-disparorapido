import { apiClient } from './apiClient';
import type { EnrichmentJob } from '../types/enrichment';

export interface StartEnrichmentRequest {
  leadId: string;
  providers: string[];
}

export const startEnrichment = async (
  leadId: string,
  providers: string[]
): Promise<EnrichmentJob> => {
  const body: StartEnrichmentRequest = { leadId, providers };
  return apiClient.post<EnrichmentJob, StartEnrichmentRequest>('/enrichments', body);
};

export const getEnrichmentJob = async (jobId: string): Promise<EnrichmentJob> => {
  return apiClient.get<EnrichmentJob>(`/enrichments/${jobId}`);
};
