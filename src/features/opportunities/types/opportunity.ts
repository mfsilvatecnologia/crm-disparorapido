export type OpportunityStage =
  | 'Lead'
  | 'Qualificado'
  | 'Proposta'
  | 'Negociacao'
  | 'Ganha'
  | 'Perdida';

export type OpportunityStatus = 'active' | 'won' | 'lost';

export interface Opportunity {
  id: string;
  leadId: string | null;
  nome: string;
  descricao: string | null;
  valorEstimado: number;
  probabilidade: number;
  estagio: OpportunityStage;
  status: OpportunityStatus;
  expectedCloseDate: string;
  motivoPerdida: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityApi {
  id: string;
  lead_id: string | null;
  nome: string;
  descricao: string | null;
  valor_estimado: number;
  probabilidade: number;
  estagio: OpportunityStage;
  status: OpportunityStatus;
  expected_close_date: string;
  motivo_perdida: string | null;
  created_at: string;
  updated_at: string;
}

export interface OpportunitiesResponseApi {
  data: OpportunityApi[];
  nextCursor: string | null;
  total: number;
}

export interface OpportunitiesResponse {
  data: Opportunity[];
  nextCursor: string | null;
  total: number;
}

export interface OpportunityFilters {
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface CreateOpportunityPayload {
  leadId?: string | null;
  nome: string;
  descricao?: string | null;
  valorEstimado: number;
  probabilidade: number;
  estagio: OpportunityStage;
  expectedCloseDate: string;
}

export interface UpdateOpportunityPayload {
  id: string;
  nome?: string;
  descricao?: string | null;
  valorEstimado?: number;
  probabilidade?: number;
  estagio?: OpportunityStage;
  expectedCloseDate?: string;
}

export interface LoseOpportunityPayload {
  motivoPerdida: string;
}

export interface WinOpportunityPayload {
  customerNome: string;
  customerEmail?: string | null;
  customerTelefone?: string | null;
  customerCnpj?: string | null;
  categoria: 'OURO' | 'PRATA' | 'BRONZE' | 'STANDARD';
  contractValue: number;
  contractStartDate: string;
  contractRenewalDate: string;
}

export interface WinOpportunityResponseApi {
  data: {
    opportunity: OpportunityApi;
    customer: {
      id: string;
      nome?: string;
      [key: string]: unknown;
    };
  };
}

export interface WinOpportunityResponse {
  opportunity: Opportunity;
  customer: {
    id: string;
    nome?: string;
    [key: string]: unknown;
  };
}
