// Campaign Types - Marketing automation and campaign management
export interface Campaign {
  id: string
  nome: string
  empresaId: string
  descricao?: string
  tipo: 'scraping_web' | 'lista_importada' | 'api_externa' | 'manual'
  status: 'rascunho' | 'ativa' | 'pausada' | 'concluida' | 'cancelada'
  dataInicio?: string | null
  dataFim?: string | null
  budgetMaximoCentavos?: number | null
  custoPorLeadCentavos?: number | null
  metaLeads?: number | null
  configuracao?: {
    palavras_chave?: string[]
    localizacao?: string
  }
  criadoPor: string
  createdAt: string
  updatedAt: string
  targetType?: string
  companyContext?: string | null
  contactOrderingStrategy?: string
  messageDelaySeconds?: number
  typingDelaySeconds?: number
  randomizeDelays?: boolean
  delayVariationPercent?: number
  sendingStartHour?: string
  sendingEndHour?: string
  timezone?: string

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
  tipo: 'scraping_web' | 'lista_importada' | 'api_externa' | 'manual'
  configuracoes?: {
    palavras_chave?: string[]
    localizacao?: string
    [key: string]: any // Para permitir outras configurações específicas por tipo
  }
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