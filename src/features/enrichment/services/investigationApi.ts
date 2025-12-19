import { apiClient } from './apiClient';
import type { Investigation } from '../types/enrichment';

export interface StartInvestigationRequest {
  dossierId: string;
}

export const startInvestigation = async (
  dossierId: string
): Promise<Investigation> => {
  const body: StartInvestigationRequest = { dossierId };
  return apiClient.post<Investigation, StartInvestigationRequest>('/investigations', body);
};

export const getInvestigation = async (id: string): Promise<Investigation> => {
  return apiClient.get<Investigation>(`/investigations/${id}`);
};
