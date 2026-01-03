// Backend uses uppercase: ATIVO, INATIVO, SUSPENSO, CANCELADO
export type CustomerStatus = 'ATIVO' | 'INATIVO' | 'SUSPENSO' | 'CANCELADO';

export type CustomerSegment = 'Enterprise' | 'SMB' | 'Startup' | 'Outro';

export interface Customer {
  id: string;
  nome: string;
  cnpj: string | null;
  segmento: CustomerSegment | null;
  status: CustomerStatus;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  notas: string | null;
  healthScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerApi {
  id: string;
  nome: string;
  cnpj: string | null;
  segmento: CustomerSegment | null;
  status: CustomerStatus;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  notas: string | null;
  health_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface CustomersResponseApi {
  data: CustomerApi[];
  nextCursor: string | null;
  total: number;
}

export interface CustomersResponse {
  data: Customer[];
  nextCursor: string | null;
  total: number;
}

export interface CustomerFilters {
  status?: CustomerStatus;
  segmento?: CustomerSegment;
  search?: string;
}

export interface UpdateCustomerPayload {
  id: string;
  nome?: string;
  segmento?: CustomerSegment | null;
  endereco?: string | null;
  telefone?: string | null;
  email?: string | null;
  notas?: string | null;
}

export interface UpdateCustomerStatusPayload {
  id: string;
  status: CustomerStatus;
}
