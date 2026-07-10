export interface LeadPreference {
  empresaId: string;
  estado: string;
  segmento: string;
  updatedAt: string;
}

export interface LeadAllocationCycle {
  id: string;
  periodStart: string;
  periodEnd: string;
  quotaTotal: number;
  quotaUsed: number;
  quotaRemaining: number;
  status: string;
}

export interface MonthlyLeadCatalogResponse {
  states: Array<{
    state: string;
    segments: Array<{
      segment: string;
      availableLeads: number;
    }>;
  }>;
}

export interface ClaimResult {
  requestId: string;
  allocationId: string | null;
  requested: number;
  delivered: number;
  partial: boolean;
  importedCount: number;
}

export interface LeadDeliveryHistoryItem {
  id: string;
  estado: string;
  segmento: string;
  requestedQty: number;
  deliveredQty: number;
  status: string;
  createdAt: string;
}

export interface DeliveredLead {
  id: string;
  estado: string;
  segmento: string;
  nome: string;
  whatsapp: string;
  telefone: string;
  email: string;
  website: string;
  endereco: string;
  cidade: string;
  cep: string;
  telefoneE164: string;
  url: string;
  allocationRequestId: string | null;
  createdAt: string;
}

export interface DeliveredLeadsResponse {
  items: DeliveredLead[];
  total: number;
  page: number;
  limit: number;
}

export type LeadExportFormat = 'leadrapido' | 'disparo';
