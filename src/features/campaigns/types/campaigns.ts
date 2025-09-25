// Campaign Types - Marketing automation and campaign management
export interface Campaign {
  id: string
  nome: string
  empresaId: string
  descricao?: string
  tipo: 'scraping_web' | 'lista_importada' | 'api_externa' | 'manual' | 'email' | 'sms' | 'whatsapp' | 'linkedin' | 'phone' | 'mixed'
  status: 'rascunho' | 'ativa' | 'pausada' | 'concluida' | 'cancelada' | 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'

  // Configurações da campanha
  configuracao: {
    autoStart: boolean
    allowManualTrigger: boolean
    maxContacts: number
    dailyLimit?: number
    timezone: string
    workingHours?: {
      start: string // HH:mm format
      end: string   // HH:mm format
      days: number[] // 0-6 (Sunday-Saturday)
    }
  }

  // Targeting e segmentação
  targeting: {
    segmentoIds?: string[]
    leadFilters?: {
      status?: string[]
      origem?: string[]
      tags?: string[]
      scoreMinimo?: number
      scoreMaximo?: number
      dataInicio?: string
      dataFim?: string
    }
    companyFilters?: {
      tamanhoEmpresa?: string[]
      segmento?: string[]
      status?: string[]
      localizacao?: string[]
    }
    customFilters?: Array<{
      field: string
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
      value: any
    }>
  }

  // Métricas e performance
  metricas: {
    totalContatos: number
    contatosProcessados: number
    contatosRestantes: number
    taxaAbertura?: number
    taxaClique?: number
    taxaResposta?: number
    taxaConversao?: number
    leads_gerados: number
    reunioesAgendadas: number
    vendas: number
    valorVendas: number
    custoTotal: number
    roi: number
  }

  // Sequência de mensagens/ações
  sequencia: CampaignStep[]

  // Metadados
  criadoPor: string
  responsavelId?: string
  empresaId?: string
  tags?: string[]

  // Datas
  dataCriacao: string
  dataAtualizacao: string
  dataInicio?: string
  dataFim?: string
  ultimaExecucao?: string
  proximaExecucao?: string
}

export interface CampaignStep {
  id: string
  ordem: number
  nome: string
  tipo: 'email' | 'sms' | 'whatsapp' | 'linkedin_message' | 'linkedin_connect' | 'phone_call' | 'task' | 'wait'

  // Timing
  delay: {
    valor: number
    unidade: 'minutes' | 'hours' | 'days' | 'weeks'
  }

  // Conteúdo
  conteudo?: {
    assunto?: string // Para emails
    mensagem: string
    template?: string
    variaveis?: Record<string, string>
    anexos?: Array<{
      nome: string
      url: string
      tipo: string
    }>
  }

  // Condições
  condicoes?: Array<{
    campo: string
    operador: string
    valor: any
  }>

  // Ações automáticas
  acoes?: Array<{
    tipo: 'add_tag' | 'remove_tag' | 'update_status' | 'assign_user' | 'create_task' | 'move_stage'
    parametros: Record<string, any>
  }>

  // Status do step
  ativo: boolean
  estatisticas?: {
    enviados: number
    entregues: number
    abertos: number
    cliques: number
    respostas: number
    erros: number
  }
}

export interface CampaignFilters {
  status?: Campaign['status'][]
  tipo?: Campaign['tipo'][]
  tags?: string[]
  criadoPor?: string
  responsavelId?: string
  empresaId?: string
  dataInicio?: string
  dataFim?: string
  search?: string
  comResultados?: boolean
  ativas?: boolean
}

export interface CreateCampaignData {
  nome: string
  descricao?: string
  tipo: Campaign['tipo']
  configuracao: Campaign['configuracao']
  targeting: Campaign['targeting']
  sequencia: Omit<CampaignStep, 'id' | 'estatisticas'>[]
  responsavelId?: string
  tags?: string[]
  dataInicio?: string
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  id: string
  status?: Campaign['status']
}

export interface CampaignsResponse {
  campaigns: Campaign[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CampaignStats {
  total: number
  ativas: number
  pausadas: number
  concluidas: number
  rascunhos: number
  porTipo: Array<{
    tipo: Campaign['tipo']
    total: number
  }>
  performanceGeral: {
    totalContatos: number
    taxaAberturaMedia: number
    taxaClickeMedia: number
    taxaConversaoMedia: number
    roiMedio: number
    valorTotalVendas: number
  }
  topPerformers: Array<{
    campaignId: string
    nome: string
    taxaConversao: number
    valorVendas: number
  }>
}

// Campaign Execution Types
export interface CampaignExecution {
  id: string
  campaignId: string
  contactId: string
  stepId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'
  tentativas: number
  proximaTentativa?: string
  dadosEnvio?: {
    provider: string
    messageId?: string
    deliveryStatus?: string
    openedAt?: string
    clickedAt?: string
    repliedAt?: string
    errorMessage?: string
  }
  metadados?: Record<string, any>
  dataAgendamento: string
  dataExecucao?: string
  dataCriacao: string
}

export interface CampaignContact {
  id: string
  campaignId: string
  contactId: string
  contactType: 'lead' | 'company_contact'
  status: 'enrolled' | 'active' | 'completed' | 'paused' | 'failed' | 'unsubscribed'
  stepAtual: number
  ultimaInteracao?: string
  proximaAcao?: string
  metricas: {
    emailsEnviados: number
    emailsAbertos: number
    linksClicados: number
    respostas: number
    reunioesAgendadas: number
    conversoes: number
  }
  dataInscricao: string
  dataUltimaAtualizacao: string
}

// Template Types
export interface CampaignTemplate {
  id: string
  nome: string
  descricao: string
  tipo: Campaign['tipo']
  categoria: string
  sequencia: Omit<CampaignStep, 'id' | 'estatisticas'>[]
  configuracaoPadrao: Campaign['configuracao']
  targeting: Campaign['targeting']
  tags: string[]
  isPublic: boolean
  usageCount: number
  rating: number
  criadoPor: string
  dataCriacao: string
}

// Analytics Types
export interface CampaignAnalytics {
  campaignId: string
  periodo: {
    inicio: string
    fim: string
  }
  metricas: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    cost: number
    ctr: number
    cpc: number
    cpa: number
    roi: number
  }
  breakdown: {
    porDia: Array<{
      data: string
      metricas: CampaignAnalytics['metricas']
    }>
    porStep: Array<{
      stepId: string
      stepNome: string
      metricas: CampaignAnalytics['metricas']
    }>
    porSegmento: Array<{
      segmento: string
      metricas: CampaignAnalytics['metricas']
    }>
  }
}

// Import/Export Types
export interface ImportCampaignData {
  nome: string
  descricao?: string
  tipo: string
  responsavel?: string
  tags?: string
  dataInicio?: string
}

export interface CampaignImportResult {
  sucesso: number
  erros: number
  duplicados: number
  detalhes: Array<{
    linha: number
    erro?: string
    campaign?: Campaign
  }>
}

// Integration Types
export interface CampaignIntegration {
  id: string
  campaignId: string
  tipo: 'email_provider' | 'sms_provider' | 'whatsapp_provider' | 'linkedin' | 'crm' | 'analytics'
  nome: string
  configuracao: Record<string, any>
  ativo: boolean
  ultimaSincronizacao?: string
  dataCriacao: string
}

// A/B Testing Types
export interface CampaignVariant {
  id: string
  campaignId: string
  nome: string
  percentualTrafico: number
  sequencia: CampaignStep[]
  metricas: Campaign['metricas']
  isWinner?: boolean
  isActive: boolean
  dataCriacao: string
}

// Novos tipos baseados no swagger para contatos de campanha
export interface AddContactsToCampaignRequest {
  contact_ids: string[]
}

export interface AddContactsToCampaignResponse {
  success: boolean
  data: CampaignContact[]
}

export interface ListCampaignContactsResponse {
  success: boolean
  data: CampaignContact[]
}

export interface CampaignContactsParams {
  ordering_strategy?: 'alphabetical' | 'random'
}

export interface CampaignContactsErrorResponse {
  success: false
  error: string
  next_available_time?: string
}