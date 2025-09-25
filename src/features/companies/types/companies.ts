// Company Types - Business data structures for company management
export interface Company {
  id: string
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  website?: string
  endereco?: {
    rua: string
    numero?: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    pais: string
  }
  segmento?: string
  tamanhoEmpresa: 'startup' | 'pequena' | 'media' | 'grande' | 'enterprise'
  status: 'ativa' | 'inativa' | 'prospecto' | 'cliente' | 'ex_cliente'

  // Informações adicionais
  descricao?: string
  numeroFuncionarios?: number
  faturamentoAnual?: number
  linkedinUrl?: string
  logoUrl?: string
  tags?: string[]

  // Dados de relacionamento
  responsavelId?: string
  leadOrigemId?: string
  campanhaId?: string

  // Metadados
  dataCriacao: string
  dataAtualizacao: string
  ultimoContato?: string
  proximoFollowUp?: string

  // Dados de scraping/enriquecimento
  dadosEnriquecidos?: {
    revenue?: string
    employees?: string
    industry?: string
    founded?: string
    headquarters?: string
    specialties?: string[]
    technologies?: string[]
    socialProfiles?: {
      linkedin?: string
      twitter?: string
      facebook?: string
    }
  }
}

export interface CompanyFilters {
  status?: Company['status'][]
  segmento?: string[]
  tamanhoEmpresa?: Company['tamanhoEmpresa'][]
  tags?: string[]
  responsavelId?: string
  campanhaId?: string
  cidade?: string
  estado?: string
  pais?: string
  dataInicio?: string
  dataFim?: string
  search?: string
  temEmail?: boolean
  temTelefone?: boolean
  temWebsite?: boolean
  faturamentoMinimo?: number
  faturamentoMaximo?: number
  funcionariosMinimo?: number
  funcionariosMaximo?: number
}

export interface CreateCompanyData {
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  website?: string
  endereco?: Company['endereco']
  segmento?: string
  tamanhoEmpresa: Company['tamanhoEmpresa']
  descricao?: string
  numeroFuncionarios?: number
  faturamentoAnual?: number
  linkedinUrl?: string
  tags?: string[]
  responsavelId?: string
  campanhaId?: string
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  id: string
  status?: Company['status']
  ultimoContato?: string
  proximoFollowUp?: string
}

export interface CompaniesResponse {
  companies: Company[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface CompanyStats {
  total: number
  ativas: number
  prospecto: number
  clientes: number
  porSegmento: Array<{
    segmento: string
    total: number
  }>
  porTamanho: Array<{
    tamanho: Company['tamanhoEmpresa']
    total: number
  }>
  porEstado: Array<{
    estado: string
    total: number
  }>
  faturamentoTotal: number
  funcionariosTotal: number
}

// Company Contact Types
export interface CompanyContact {
  id: string
  companyId: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
  departamento?: string
  linkedinUrl?: string
  isPrimary: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export interface CreateContactData {
  companyId: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
  departamento?: string
  linkedinUrl?: string
  isPrimary?: boolean
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: string
}

// Company Activity Types
export interface CompanyActivity {
  id: string
  companyId: string
  tipo: 'email' | 'chamada' | 'reuniao' | 'visita' | 'proposta' | 'contrato' | 'nota' | 'status_change'
  titulo: string
  descricao?: string
  data: string
  usuarioId: string
  contatoId?: string
  valor?: number
  status?: 'agendada' | 'realizada' | 'cancelada' | 'reagendada'
  metadata?: Record<string, any>
}

// Company Integration Types
export interface CompanyIntegration {
  id: string
  companyId: string
  tipo: 'crm' | 'erp' | 'email' | 'calendar' | 'social' | 'analytics'
  nome: string
  configuracao: Record<string, any>
  ativo: boolean
  ultimaSincronizacao?: string
  dataCriacao: string
}

// Import/Export Types
export interface ImportCompanyData {
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  website?: string
  segmento?: string
  tamanhoEmpresa?: string
  cidade?: string
  estado?: string
  numeroFuncionarios?: string
  faturamentoAnual?: string
  tags?: string
}

export interface CompanyImportResult {
  sucesso: number
  erros: number
  duplicados: number
  detalhes: Array<{
    linha: number
    erro?: string
    company?: Company
  }>
}

// Enrichment Types
export interface CompanyEnrichmentRequest {
  companyId: string
  website?: string
  linkedinUrl?: string
  cnpj?: string
}

export interface CompanyEnrichmentResult {
  companyId: string
  dadosEncontrados: Company['dadosEnriquecidos']
  confiabilidade: number
  fonte: string
  dataEnriquecimento: string
}