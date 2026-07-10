export type CommissionOriginType =
  | 'subscription'
  | 'subscription_payment'
  | 'credit_purchase'
  | 'subscription_renewal';

export type CommissionStatus = 'pending' | 'credited' | 'failed';

export type ModoRepasse = 'ASAAS_SPLIT' | 'MANUAL_NF';

export type StatusCadastroAfiliado = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface AffiliateCadastro {
  statusCadastro: StatusCadastroAfiliado;
  motivoRejeicao?: string | null;
  permiteCorrecaoCadastro?: boolean | null;
  nome: string;
  email: string;
  cnpj?: string | null;
  telefone?: string | null;
  razao_social?: string | null;
  area_atuacao?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  chave_pix?: string | null;
  chave_pix_tipo?: string | null;
}

export interface AffiliateCadastroResubmitBody {
  nome?: string;
  telefone?: string;
  razao_social?: string;
  area_atuacao?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string | null;
  bairro?: string;
  cidade?: string;
  estado?: string;
  chave_pix?: string;
  chave_pix_tipo?: string;
}

export interface AffiliateCode {
  codigoAfiliado: string;
  /** UUID para chamadas autenticadas que exigem o id interno (ex.: listagem de clientes). */
  codigoAfiliadoId?: string;
  /** Comissão fixa por pagamento no plano mensal (centavos). */
  comissaoMensalCentavos?: number;
  /** Comissão fixa por pagamento no plano anual (centavos). */
  comissaoAnualCentavos?: number;
  /** @deprecated legado percentual — preferir comissaoMensal/AnualCentavos */
  comissaoPadraoTipo?: 'percentual' | 'fixo';
  comissaoPadraoValor?: number;
  ativo: boolean;
  linkIndicacao: string | null;
  statusCadastro?: StatusCadastroAfiliado;
  motivoRejeicao?: string | null;
  permiteCorrecaoCadastro?: boolean | null;
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
  periodoReferencia?: string;
}

export type AffiliateSaldoPorMesStatus =
  | 'disponivel'
  | 'aguardando_nf'
  | 'nf_enviada'
  | 'em_analise'
  | 'aprovado'
  | 'pago'
  | 'divergencia'
  | 'cancelado';

export interface AffiliateSaldoPorMes {
  periodoReferencia: string;
  valorCentavos: number;
  status: AffiliateSaldoPorMesStatus;
  repasseId?: string;
  podeEnviarNf: boolean;
}

export interface AffiliateSaldoMesClienteDetalhe {
  empresaId: string | null;
  nomeEmpresa: string;
  status: string;
  billingCycle: string | null;
  valorBrutoCentavos: number;
  comissaoCentavos: number;
  pagamentoEm: string | null;
}

export interface AffiliateSaldoMesDetalhe {
  periodoReferencia: string;
  totalClientes: number;
  valorBrutoCentavos: number;
  comissaoCentavos: number;
  clientes: AffiliateSaldoMesClienteDetalhe[];
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
  saldosPorMes?: AffiliateSaldoPorMes[];
  financeiroPainel?: AffiliateFinanceiroPainel;
}

/** Item de GET /afiliados/me/chaves-pix (chave mascarada) */
export interface AffiliatePixKey {
  id: string;
  chavePix: string;
  chavePixTipo?: string | null;
  ativa: boolean;
  createdAt: string;
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
  historico_status?: Array<{
    id: string;
    status_anterior: string | null;
    status_novo: string;
    observacao?: string | null;
    alterado_por_user_id?: string | null;
    alterado_por_nome?: string | null;
    alterado_por_tipo: 'admin' | 'afiliado' | 'sistema';
    created_at: string;
  }>;
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
