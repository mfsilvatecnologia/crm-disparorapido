// Lead Types - Core CRM data structures
export interface Lead {
  id: string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  origem: 'website' | 'scraping' | 'importacao' | 'manual'
  status: 'novo' | 'qualificado' | 'contatado' | 'interessado' | 'desqualificado' | 'convertido'
  score?: number
  tags?: string[]
  observacoes?: string
  dataCriacao: string
  dataAtualizacao: string
  usuarioId?: string
  empresaId?: string
  campanhaId?: string

  // Dados adicionais de scraping
  nomeEmpresa?: string | null
  nomeContato?: string | null
  linkedinUrl?: string
  segmento?: string
  localizacao?: string
  tamanhoEmpresa?: string

  // Novos campos conforme especificação da API
  cargoContato?: string
  siteEmpresa?: string
  cnpj?: string
  porteEmpresa?: string
  numFuncionarios?: number
  receitaAnualEstimada?: number
  endereco?: {
    rua?: string
    numero?: string
    cidade?: string
    estado?: string
    cep?: string
    pais?: string
    latitude?: number
    longitude?: number
  }
  dadosOriginais?: Record<string, any>
  custoAquisicao?: number
  fonte?: string
  descricaoEmpresa?: string
  ultimoContato?: string
  scoreQualificacao?: number
}

export interface LeadFilters {
  status?: Lead['status'][]
  origem?: Lead['origem'][]
  tags?: string[]
  empresaId?: string
  campanhaId?: string
  dataInicio?: string
  dataFim?: string
  search?: string
  scoreMinimo?: number
  scoreMaximo?: number
}

export interface CreateLeadData {
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  origem: Lead['origem']
  tags?: string[]
  observacoes?: string
  empresaId?: string
  campanhaId?: string
}

export interface UpdateLeadData extends Partial<CreateLeadData> {
  id: string
  status?: Lead['status']
  score?: number
}

// Interface conforme especificação da API
export interface UpdateLeadDTO {
  nomeContato?: string
  cargoContato?: string
  email?: string
  telefone?: string
  linkedinUrl?: string
  siteEmpresa?: string
  cnpj?: string
  segmento?: string
  porteEmpresa?: string
  numFuncionarios?: number
  receitaAnualEstimada?: number
  descricaoEmpresa?: string
  endereco?: {
    rua?: string
    numero?: string
    cidade?: string
    estado?: string
    cep?: string
    pais?: string
    latitude?: number
    longitude?: number
  }
  tags?: string[]
  observacoes?: string
  dadosOriginais?: Record<string, any>
  custoAquisicao?: number
}

export interface LeadsResponse {
  leads: Lead[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface LeadStats {
  total: number
  novos: number
  qualificados: number
  convertidos: number
  scorePromedio: number
  taxaConversao: number
}

// Lead Activity Types
export interface LeadActivity {
  id: string
  leadId: string
  tipo: 'email' | 'chamada' | 'reuniao' | 'nota' | 'status_change' | 'score_update'
  descricao: string
  data: string
  usuarioId: string
  metadata?: Record<string, any>
}

// Lead Import Types
export interface ImportLeadData {
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cargo?: string
  tags?: string
  observacoes?: string
}

export interface ImportResult {
  sucesso: number
  erros: number
  duplicados: number
  detalhes: Array<{
    linha: number
    erro?: string
    lead?: Lead
  }>
}