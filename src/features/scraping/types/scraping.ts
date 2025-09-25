// Scraping Types - Google Maps scraping and data collection
export interface SearchTerm {
  id: string
  termo: string
  categoria: string
  ativo: boolean
  configuracao: {
    localizacao?: string
    raioKm?: number
    filtros?: {
      avaliacaoMinima?: number
      apenasComTelefone?: boolean
      apenasComWebsite?: boolean
      excluirCadeias?: boolean
    }
  }

  // Estatísticas
  estatisticas: {
    totalExecucoes: number
    totalResultados: number
    ultimaExecucao?: string
    proximaExecucao?: string
    mediaResultadosPorExecucao: number
    taxaSucesso: number
  }

  // Metadados
  criadoPor: string
  dataCriacao: string
  dataAtualizacao: string
  ultimaUtualizacao: string
}

export interface ScrapingJob {
  id: string
  searchTermId: string
  searchTerm?: SearchTerm
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

  // Configuração do job
  parametros: {
    termo: string
    localizacao?: string
    raioKm?: number
    maxResultados?: number
    filtros?: SearchTerm['configuracao']['filtros']
  }

  // Progresso
  progresso: {
    totalEstimado: number
    processados: number
    sucessos: number
    erros: number
    percentualCompleto: number
    etapaAtual: string
  }

  // Resultados
  resultados: {
    leadsEncontrados: number
    leadsNovos: number
    leadsAtualizados: number
    leadsDescartados: number
    empresasEncontradas: number
    empresasNovas: number
  }

  // Timing
  tempoEstimado?: number // minutos
  tempoDecorrido?: number // minutos
  dataInicio?: string
  dataFim?: string

  // Logs e erros
  logs: string[]
  erros: Array<{
    timestamp: string
    mensagem: string
    contexto?: any
  }>

  // Metadados
  criadoPor: string
  dataCriacao: string
  dataUltimaAtualizacao: string
}

export interface WorkerStatus {
  isRunning: boolean
  startTime?: string
  uptime?: number // segundos
  processedJobs: number
  errorCount: number
  currentJob?: {
    id: string
    searchTerm: string
    startTime: string
    progress: number
    eta?: number // minutos
  }
  config?: {
    maxConcurrentJobs?: number
    retryAttempts?: number
    delayBetweenRequests?: number
    userAgent?: string
  }

  // Performance metrics
  performance: {
    avgJobDuration: number // minutos
    successRate: number // 0-1
    jobsPerHour: number
    memoryUsage?: number
    cpuUsage?: number
  }

  // Health check
  lastHealthCheck: string
  healthStatus: 'healthy' | 'warning' | 'error'
  issues?: string[]
}

export interface ScrapingFilters {
  status?: ScrapingJob['status'][]
  searchTermId?: string[]
  criadoPor?: string[]
  dataInicioMin?: string
  dataInicioMax?: string
  dataFimMin?: string
  dataFimMax?: string
  temResultados?: boolean
  search?: string
}

export interface SearchTermFilters {
  categoria?: string[]
  ativo?: boolean
  criadoPor?: string[]
  temEstatisticas?: boolean
  search?: string
}

export interface CreateSearchTermData {
  termo: string
  categoria: string
  ativo?: boolean
  configuracao?: SearchTerm['configuracao']
}

export interface UpdateSearchTermData extends Partial<CreateSearchTermData> {
  id: string
}

export interface CreateScrapingJobData {
  searchTermId: string
  parametros?: Partial<ScrapingJob['parametros']>
  agendarPara?: string
}

export interface ScrapingJobsResponse {
  jobs: ScrapingJob[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface SearchTermsResponse {
  terms: SearchTerm[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ScrapingStats {
  totalJobs: number
  jobsAtivos: number
  jobsCompletados: number
  jobsFalharam: number

  // Hoje
  jobsHoje: number
  leadsHoje: number
  empresasHoje: number

  // Performance
  tempoMedioJob: number // minutos
  taxaSucessoGeral: number
  totalLeadsColetados: number
  totalEmpresasColetadas: number

  // Por status
  porStatus: Array<{
    status: ScrapingJob['status']
    count: number
    percentual: number
  }>

  // Por categoria
  porCategoria: Array<{
    categoria: string
    totalJobs: number
    totalResultados: number
    taxaSucesso: number
  }>

  // Timeline últimos 7 dias
  timeline: Array<{
    data: string
    jobsCompletos: number
    leadsColetados: number
    empresasColetadas: number
    tempoMedio: number
  }>
}

export interface ScrapingResult {
  id: string
  jobId: string
  tipo: 'lead' | 'empresa'

  // Dados básicos
  nome: string
  categoria?: string
  endereco?: {
    rua?: string
    numero?: string
    cidade: string
    estado: string
    cep?: string
    pais: string
    coordenadas?: {
      lat: number
      lng: number
    }
  }

  // Contato
  telefone?: string
  email?: string
  website?: string

  // Google Maps data
  googleMapsData: {
    placeId: string
    nome: string
    categoria: string
    rating?: number
    totalAvaliacoes?: number
    priceLevel?: number
    horarioFuncionamento?: string[]
    fotos?: string[]
  }

  // Status de processamento
  status: 'novo' | 'processado' | 'duplicado' | 'descartado' | 'erro'
  motivoDescarte?: string

  // Metadados
  coletadoEm: string
  processadoEm?: string
}

// Dashboard types
export interface ScrapingDashboard {
  stats: ScrapingStats
  workerStatus: WorkerStatus
  jobsRecentes: ScrapingJob[]
  termosAtivos: SearchTerm[]
  alertas: Array<{
    tipo: 'info' | 'warning' | 'error'
    titulo: string
    mensagem: string
    timestamp: string
  }>
}

// Configuration types
export interface ScrapingConfig {
  worker: {
    maxConcurrentJobs: number
    retryAttempts: number
    delayBetweenRequests: number
    requestTimeout: number
    userAgent: string
    proxy?: {
      enabled: boolean
      servers: string[]
    }
  }

  defaults: {
    raioKmPadrao: number
    maxResultadosPorTermo: number
    filtrosAvaliacaoMinima: number
    agendamentoAutomatico: boolean
    intervaloExecucaoHoras: number
  }

  quotas: {
    maxJobsPorDia: number
    maxResultadosPorJob: number
    limiteTarifario: number // BRL
  }
}

// Export/Import types
export interface ScrapingExportData {
  searchTerms: SearchTerm[]
  jobs: ScrapingJob[]
  results: ScrapingResult[]
  config: ScrapingConfig
}

export interface BulkImportResult {
  searchTerms: {
    importados: number
    atualizados: number
    erros: number
  }
  jobs: {
    importados: number
    erros: number
  }
  detalhes: Array<{
    tipo: 'search_term' | 'job'
    item: string
    status: 'sucesso' | 'erro'
    erro?: string
  }>
}