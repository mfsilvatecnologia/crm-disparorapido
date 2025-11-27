export type CommissionOriginType =
  | 'subscription'
  | 'subscription_payment'
  | 'credit_purchase'
  | 'subscription_renewal';

export type CommissionStatus = 'pending' | 'credited' | 'failed';

export interface AffiliateCode {
  codigoAfiliado: string;
  comissaoPadraoTipo: 'percentual' | 'fixo';
  comissaoPadraoValor: number;
  ativo: boolean;
  linkIndicacao: string;
}

export interface CommissionSummary {
  id: string;
  tipoOrigem: CommissionOriginType;
  comissaoCreditos: number;
  status: CommissionStatus;
  createdAt: string;
}

export interface AffiliateStatistics {
  codigoAfiliado: string;
  totalIndicacoes: number;
  totalComissoesCreditos: number;
  totalValorGeradoCentavos: number;
  ativo: boolean;
  createdAt: string;
  ultimasComissoes: CommissionSummary[];
}

export interface Commission {
  id: string;
  afiliadoId?: string;
  empresaIndicadaNome?: string;
  tipoOrigem: CommissionOriginType;
  valorPagamentoCentavos: number;
  comissaoCreditos: number;
  status: CommissionStatus;
  criadoEm: string;
  creditadoEm: string | null;
}

export interface CommissionListResponse {
  items: Commission[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CommissionListParams {
  limit?: number;
  offset?: number;
}
