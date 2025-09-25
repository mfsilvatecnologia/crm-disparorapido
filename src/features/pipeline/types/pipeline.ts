// Pipeline Types - Sales pipeline and deal management
export interface PipelineStage {
  id: string
  nome: string
  ordem: number
  cor: string
  probabilidade: number // 0-100
  isFinal: boolean
  isActive: boolean
  configuracao?: {
    tempoMaximo?: number // dias
    acaoAutomatica?: 'mover' | 'notificar' | 'arquivar'
    proximoStageId?: string
  }
  dataCriacao: string
  dataAtualizacao: string
}

export interface Deal {
  id: string
  titulo: string
  descricao?: string
  valor: number
  probabilidade: number // 0-100

  // Relacionamentos
  stageId: string
  stage?: PipelineStage
  leadId?: string
  empresaId?: string
  responsavelId?: string

  // Dados do contato
  nomeContato?: string
  emailContato?: string
  telefoneContato?: string
  cargoContato?: string

  // Dados da empresa
  nomeEmpresa?: string
  segmentoEmpresa?: string

  // Timeline e ações
  proximaAcao?: string
  dataProximaAcao?: string
  ultimaInteracao?: string
  historicoAcoes: DealActivity[]

  // Metadados
  origem: 'manual' | 'lead_conversion' | 'import' | 'api' | 'campaign'
  tags?: string[]
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'ativo' | 'ganho' | 'perdido' | 'pausado' | 'arquivado'

  // Métricas
  tempoNoStage: number // dias
  tempoTotalPipeline: number // dias

  // Datas
  dataCriacao: string
  dataAtualizacao: string
  dataFechamento?: string
  dataUltimaAtualizacao: string
}

export interface DealActivity {
  id: string
  dealId: string
  tipo: 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task' | 'document'
  titulo: string
  descricao?: string
  resultado?: 'positivo' | 'neutro' | 'negativo'

  // Dados da atividade
  duracao?: number // minutos
  participantes?: string[]
  anexos?: Array<{
    nome: string
    url: string
    tipo: string
    tamanho?: number
  }>

  // Agendamento
  dataAgendamento?: string
  dataRealizacao?: string
  isCompleta: boolean

  // Metadados
  criadoPor: string
  responsavelId?: string
  dataCriacao: string
}

export interface PipelineFilters {
  stageId?: string[]
  responsavelId?: string[]
  status?: Deal['status'][]
  prioridade?: Deal['prioridade'][]
  valorMin?: number
  valorMax?: number
  probabilidadeMin?: number
  probabilidadeMax?: number
  dataInicioMin?: string
  dataInicioMax?: string
  dataFechamentoMin?: string
  dataFechamentoMax?: string
  origem?: Deal['origem'][]
  tags?: string[]
  search?: string
  temNoStageMin?: number // dias
  temNoStageMax?: number // dias
}

export interface CreateDealData {
  titulo: string
  descricao?: string
  valor: number
  probabilidade: number
  stageId: string
  leadId?: string
  empresaId?: string
  responsavelId?: string
  nomeContato?: string
  emailContato?: string
  telefoneContato?: string
  cargoContato?: string
  nomeEmpresa?: string
  segmentoEmpresa?: string
  proximaAcao?: string
  dataProximaAcao?: string
  origem: Deal['origem']
  tags?: string[]
  prioridade: Deal['prioridade']
}

export interface UpdateDealData extends Partial<CreateDealData> {
  id: string
  status?: Deal['status']
}

export interface DealsResponse {
  deals: Deal[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PipelineStats {
  totalDeals: number
  totalValor: number
  valorMedio: number
  taxaConversaoGeral: number
  tempoMedioFechamento: number // dias

  porStage: Array<{
    stageId: string
    stageName: string
    count: number
    valor: number
    taxaConversao: number
    tempoMedio: number
  }>

  porStatus: Array<{
    status: Deal['status']
    count: number
    valor: number
    percentual: number
  }>

  porResponsavel: Array<{
    responsavelId: string
    nomeResponsavel: string
    count: number
    valor: number
    taxaConversao: number
  }>

  performanceMensal: Array<{
    mes: string
    novosDeals: number
    dealsFechados: number
    valorFechado: number
    taxaConversao: number
  }>
}

export interface CreateStageData {
  nome: string
  ordem: number
  cor: string
  probabilidade: number
  isFinal?: boolean
  configuracao?: PipelineStage['configuracao']
}

export interface UpdateStageData extends Partial<CreateStageData> {
  id: string
  isActive?: boolean
}

export interface StagesResponse {
  stages: PipelineStage[]
  total: number
}

// Pipeline Board Types for Kanban view
export interface BoardColumn {
  stage: PipelineStage
  deals: Deal[]
  totalValue: number
  count: number
}

export interface DealMove {
  dealId: string
  fromStageId: string
  toStageId: string
  reason?: string
  notes?: string
}

// Activity Types
export interface CreateActivityData {
  dealId: string
  tipo: DealActivity['tipo']
  titulo: string
  descricao?: string
  resultado?: DealActivity['resultado']
  duracao?: number
  participantes?: string[]
  dataAgendamento?: string
  dataRealizacao?: string
  isCompleta?: boolean
  responsavelId?: string
}

export interface UpdateActivityData extends Partial<CreateActivityData> {
  id: string
}

export interface ActivitiesResponse {
  activities: DealActivity[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Dashboard Types
export interface PipelineDashboard {
  stats: PipelineStats
  recentDeals: Deal[]
  activitiesHoje: DealActivity[]
  dealsVencendoHoje: Deal[]
  topPerformers: Array<{
    responsavelId: string
    nomeResponsavel: string
    valorFechado: number
    dealsFechados: number
    taxaSucesso: number
  }>
}

// Forecast Types
export interface PipelineForecast {
  periodo: {
    inicio: string
    fim: string
  }
  previsaoFechamento: {
    provavel: number
    otimista: number
    conservador: number
    melhorCaso: number
    piorCaso: number
  }
  porStage: Array<{
    stageId: string
    stageName: string
    valor: number
    count: number
    probabilidade: number
    previsaoFechamento: number
  }>
  tendencia: 'crescimento' | 'estabilidade' | 'declinio'
  confianca: number // 0-100
}