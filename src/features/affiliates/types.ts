export type CommissionOriginType =
  | 'subscription'
  | 'subscription_payment'
  | 'credit_purchase'
  | 'subscription_renewal';

export type CommissionStatus = 'pending' | 'credited' | 'failed';

export type ModoRepasse = 'ASAAS_SPLIT' | 'MANUAL_NF';

export interface AffiliateCode {
  codigoAfiliado: string;
  /** UUID para chamadas autenticadas que exigem o id interno (ex.: listagem de clientes). */
  codigoAfiliadoId?: string;
  comissaoPadraoTipo: 'percentual' | 'fixo';
  comissaoPadraoValor: number;
  ativo: boolean;
  linkIndicacao: string;
  tipoPlano?: 'ISENTO' | 'MENSALIDADE';
  statusAssinatura?: 'ATIVA' | 'INADIMPLENTE' | 'ISENTA';
  mensalidadePagamentoUrl?: string | null;
  modoRepasse?: ModoRepasse;
}

export interface CommissionSummary {
  id: string;
  tipoOrigem: CommissionOriginType;
  comissaoCreditos: number;
  status: CommissionStatus;
  createdAt: string;
}

/** Painel financeiro (assinaturas indicadas) — GET /afiliados/estatisticas */
export interface AffiliateFinanceiroPainel {
  vendasBrutasCentavos: number;
  ganhoLiquidoCentavos: number;
  totalRecuperacaoCentavos: number;
  faturasTotal: number;
  faturasPagas: number;
  faturasAbertas: number;
  faturasCanceladas: number;
  faturasExpiradas: number;
}

export interface AffiliateStatistics {
  codigoAfiliado: string;
  codigoAfiliadoId?: string;
  totalIndicacoes: number;
  totalComissoesCreditos: number;
  totalValorGeradoCentavos: number;
  ativo: boolean;
  createdAt: string;
  ultimasComissoes: CommissionSummary[];
  tipoPlano?: 'ISENTO' | 'MENSALIDADE';
  statusAssinatura?: 'ATIVA' | 'INADIMPLENTE' | 'ISENTA';
  mensalidadePagamentoUrl?: string | null;
  modoRepasse?: ModoRepasse;
  saldoDisponivelCentavos?: number | null;
  saldoPendenteRepasseCentavos?: number | null;
  financeiroPainel?: AffiliateFinanceiroPainel;
}

/** Linha de GET /afiliados/:id/repassos */
export interface AffiliateRepasseRow {
  id: string;
  afiliado_id: string;
  periodo_referencia: string;
  valor_calculado_centavos: number;
  status: string;
  storage_bucket?: string | null;
  storage_object_key?: string | null;
  mime?: string | null;
  tamanho_bytes?: number | null;
  uploaded_at?: string | null;
  admin_observacao?: string | null;
  paid_at?: string | null;
  paid_by_user_id?: string | null;
  comprovante_pix_bucket?: string | null;
  comprovante_pix_object_key?: string | null;
  comprovante_pix_mime?: string | null;
  comprovante_pix_tamanho_bytes?: number | null;
  comprovante_pix_uploaded_at?: string | null;
  created_at: string;
  updated_at: string;
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

/** Linha retornada por GET /afiliados/:id/clientes */
export interface AffiliateClienteIndicado {
  id: string;
  status: string;
  value: number;
  created_at: string;
  empresa_id?: string | null;
  billing_cycle?: string | null;
  empresa_nome?: string | null;
  produto_nome?: string | null;
  plano_label?: string | null;
  forma_pagamento?: string | null;
  last_payment_date?: string | null;
  next_due_date?: string | null;
}
