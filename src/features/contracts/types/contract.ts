export type ContractStatus = 'VIGENTE' | 'VENCIDO' | 'RENOVADO' | 'CANCELADO';

export interface Contract {
  id: string;
  customerId: string;
  numero: string;
  valor: number;
  moeda: string;
  dataInicio: string;
  dataFim: string;
  servicos: string;
  condicoes: string | null;
  status: ContractStatus;
  arquivoUrl: string | null;
  contratoAnteriorId: string | null;
  daysUntilEnd?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NearRenewalContract extends Contract {
  daysUntilRenewal: number;
}

export interface ContractApi {
  id: string;
  customer_id: string;
  empresa_id: string;
  numero: string;
  valor: number;
  moeda: string;
  data_inicio: string;
  data_fim: string;
  servicos: string;
  condicoes: string | null;
  status: ContractStatus;
  arquivo_url: string | null;
  contrato_anterior_id?: string | null;
  days_until_end?: number;
  created_at: string;
  updated_at: string;
}

export interface NearRenewalContractApi extends ContractApi {
  days_until_renewal: number;
}

export interface CreateContractPayload {
  customerId: string;
  numero: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  servicos: string;
  moeda?: string;
  condicoes?: string | null;
  status?: ContractStatus;
}

export interface UpdateContractPayload {
  id: string;
  valor?: number;
  servicos?: string;
  condicoes?: string | null;
  status?: ContractStatus;
  arquivoUrl?: string | null;
}

export interface RenewContractPayload {
  id: string;
  numero: string;
  valor: number;
  dataInicio: string;
  dataFim: string;
  servicos: string;
  moeda?: string;
  condicoes?: string | null;
  arquivoUrl?: string | null;
}
