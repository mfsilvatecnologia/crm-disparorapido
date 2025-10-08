/**
 * Marketplace API Client
 * 
 * API methods for lead marketplace operations
 */

import { apiClient } from '@/lib/api-client';
import type { 
  Lead,
  LeadFull,
  LeadAccess,
  LeadWithAccess 
} from '../types';
import type {
  LeadSearchFiltersSchema,
  GrantTrialAccessSchema
} from '../schemas';
import { validateLead, validateLeadFull, validateLeadAccess } from '../schemas';

/**
 * Base path for marketplace API
 */
const BASE_PATH = '/api/marketplace';

/**
 * Fetch marketplace leads with filters
 */
export async function fetchMarketplaceLeads(
  filters?: LeadSearchFiltersSchema
): Promise<{
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}> {
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
  const url = params ? `${BASE_PATH}/leads?${params}` : `${BASE_PATH}/leads`;
  
  const data = await apiClient.get<{
    leads: Lead[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }>(url);
  
  // Validate each lead
  data.leads.forEach(lead => {
    const validation = validateLead(lead);
    if (!validation.success) {
      throw new Error('Invalid lead data from API');
    }
  });
  
  return data;
}

/**
 * Fetch lead preview (masked data)
 */
export async function fetchLeadPreview(leadId: string): Promise<Lead> {
  const data = await apiClient.get<Lead>(`${BASE_PATH}/leads/${leadId}/preview`);
  
  // Validate response
  const validation = validateLead(data);
  if (!validation.success) {
    throw new Error('Invalid lead data from API');
  }
  
  return data;
}

/**
 * Fetch purchased leads (full data)
 */
export async function fetchPurchasedLeads(
  filters?: {
    page?: number;
    limit?: number;
    segmento?: string[];
  }
): Promise<{
  leads: LeadFull[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = filters ? new URLSearchParams(filters as any).toString() : '';
  const url = params ? `${BASE_PATH}/purchased?${params}` : `${BASE_PATH}/purchased`;
  
  const data = await apiClient.get<{
    leads: LeadFull[];
    total: number;
    page: number;
    limit: number;
  }>(url);
  
  // Validate each lead
  data.leads.forEach(lead => {
    const validation = validateLeadFull(lead);
    if (!validation.success) {
      throw new Error('Invalid purchased lead data from API');
    }
  });
  
  return data;
}

/**
 * Fetch lead with access info
 */
export async function fetchLeadWithAccess(leadId: string): Promise<LeadWithAccess> {
  return await apiClient.get<LeadWithAccess>(`${BASE_PATH}/leads/${leadId}`);
}

/**
 * Grant trial access to lead
 */
export async function grantTrialAccess(
  data: GrantTrialAccessSchema
): Promise<LeadAccess> {
  const result = await apiClient.post<LeadAccess>(
    `${BASE_PATH}/trial-access`,
    data
  );
  
  // Validate response
  const validation = validateLeadAccess(result);
  if (!validation.success) {
    throw new Error('Invalid lead access data from API');
  }
  
  return result;
}

/**
 * Record lead view
 */
export async function recordLeadView(
  acessoId: string
): Promise<{
  visualizacoesCount: number;
  limiteVisualizacoes: number | null;
  visualizacoesRestantes: number | null;
}> {
  return await apiClient.post<{
    visualizacoesCount: number;
    limiteVisualizacoes: number | null;
    visualizacoesRestantes: number | null;
  }>(`${BASE_PATH}/record-view`, { acessoId });
}

/**
 * Fetch lead access details
 */
export async function fetchLeadAccess(leadId: string): Promise<LeadAccess | null> {
  try {
    const data = await apiClient.get<LeadAccess>(`${BASE_PATH}/access/${leadId}`);
    
    // Validate response
    const validation = validateLeadAccess(data);
    if (!validation.success) {
      throw new Error('Invalid lead access data from API');
    }
    
    return data;
  } catch (error: any) {
    // Return null if no access found (404)
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Search leads with autocomplete
 */
export async function searchLeads(query: string): Promise<Lead[]> {
  const data = await apiClient.get<Lead[]>(`${BASE_PATH}/search`, {
    params: { q: query }
  });
  
  // Validate each lead
  data.forEach(lead => {
    const validation = validateLead(lead);
    if (!validation.success) {
      throw new Error('Invalid lead data from API');
    }
  });
  
  return data;
}
