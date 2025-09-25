// Company Services - API integration for company management
import { apiClient } from '@/shared/services/client'
import type {
  Company,
  CompanyFilters,
  CreateCompanyData,
  UpdateCompanyData,
  CompaniesResponse,
  CompanyStats,
  CompanyContact,
  CreateContactData,
  UpdateContactData,
  CompanyActivity,
  CompanyImportResult,
  CompanyEnrichmentRequest,
  CompanyEnrichmentResult
} from '../types/companies'

const COMPANIES_ENDPOINT = '/api/companies'

// Company CRUD Operations
export async function fetchCompanies(filters: CompanyFilters = {}): Promise<CompaniesResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters.segmento?.length) {
      filters.segmento.forEach(seg => params.append('segmento', seg))
    }
    if (filters.tamanhoEmpresa?.length) {
      filters.tamanhoEmpresa.forEach(size => params.append('tamanhoEmpresa', size))
    }
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }
    if (filters.responsavelId) params.append('responsavelId', filters.responsavelId)
    if (filters.campanhaId) params.append('campanhaId', filters.campanhaId)
    if (filters.cidade) params.append('cidade', filters.cidade)
    if (filters.estado) params.append('estado', filters.estado)
    if (filters.pais) params.append('pais', filters.pais)
    if (filters.dataInicio) params.append('dataInicio', filters.dataInicio)
    if (filters.dataFim) params.append('dataFim', filters.dataFim)
    if (filters.search) params.append('search', filters.search)
    if (filters.temEmail !== undefined) params.append('temEmail', filters.temEmail.toString())
    if (filters.temTelefone !== undefined) params.append('temTelefone', filters.temTelefone.toString())
    if (filters.temWebsite !== undefined) params.append('temWebsite', filters.temWebsite.toString())
    if (filters.faturamentoMinimo) params.append('faturamentoMinimo', filters.faturamentoMinimo.toString())
    if (filters.faturamentoMaximo) params.append('faturamentoMaximo', filters.faturamentoMaximo.toString())
    if (filters.funcionariosMinimo) params.append('funcionariosMinimo', filters.funcionariosMinimo.toString())
    if (filters.funcionariosMaximo) params.append('funcionariosMaximo', filters.funcionariosMaximo.toString())

    const queryString = params.toString()
    const url = queryString ? `${COMPANIES_ENDPOINT}?${queryString}` : COMPANIES_ENDPOINT

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw new Error('Falha ao buscar empresas')
  }
}

export async function fetchCompany(id: string): Promise<Company> {
  try {
    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching company:', error)
    throw new Error('Falha ao buscar empresa')
  }
}

export async function createCompany(data: CreateCompanyData): Promise<Company> {
  try {
    const response = await apiClient.post(COMPANIES_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating company:', error)
    throw new Error('Falha ao criar empresa')
  }
}

export async function updateCompany(data: UpdateCompanyData): Promise<Company> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${COMPANIES_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating company:', error)
    throw new Error('Falha ao atualizar empresa')
  }
}

export async function deleteCompany(id: string): Promise<void> {
  try {
    await apiClient.delete(`${COMPANIES_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting company:', error)
    throw new Error('Falha ao deletar empresa')
  }
}

// Company Statistics
export async function fetchCompanyStats(filters?: Partial<CompanyFilters>): Promise<CompanyStats> {
  try {
    const params = new URLSearchParams()
    if (filters?.responsavelId) params.append('responsavelId', filters.responsavelId)
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio)
    if (filters?.dataFim) params.append('dataFim', filters.dataFim)

    const queryString = params.toString()
    const url = queryString ? `${COMPANIES_ENDPOINT}/stats?${queryString}` : `${COMPANIES_ENDPOINT}/stats`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching company stats:', error)
    throw new Error('Falha ao buscar estatísticas de empresas')
  }
}

// Company Contacts
export async function fetchCompanyContacts(companyId: string): Promise<CompanyContact[]> {
  try {
    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/${companyId}/contacts`)
    return response.data
  } catch (error) {
    console.error('Error fetching company contacts:', error)
    throw new Error('Falha ao buscar contatos da empresa')
  }
}

export async function createCompanyContact(data: CreateContactData): Promise<CompanyContact> {
  try {
    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/${data.companyId}/contacts`, data)
    return response.data
  } catch (error) {
    console.error('Error creating company contact:', error)
    throw new Error('Falha ao criar contato')
  }
}

export async function updateCompanyContact(data: UpdateContactData): Promise<CompanyContact> {
  try {
    const { id, companyId, ...updateData } = data
    const response = await apiClient.put(`${COMPANIES_ENDPOINT}/${companyId}/contacts/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating company contact:', error)
    throw new Error('Falha ao atualizar contato')
  }
}

export async function deleteCompanyContact(companyId: string, contactId: string): Promise<void> {
  try {
    await apiClient.delete(`${COMPANIES_ENDPOINT}/${companyId}/contacts/${contactId}`)
  } catch (error) {
    console.error('Error deleting company contact:', error)
    throw new Error('Falha ao deletar contato')
  }
}

// Company Activities
export async function fetchCompanyActivities(companyId: string): Promise<CompanyActivity[]> {
  try {
    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/${companyId}/activities`)
    return response.data
  } catch (error) {
    console.error('Error fetching company activities:', error)
    throw new Error('Falha ao buscar atividades da empresa')
  }
}

export async function addCompanyActivity(companyId: string, activity: Omit<CompanyActivity, 'id' | 'companyId' | 'data'>): Promise<CompanyActivity> {
  try {
    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/${companyId}/activities`, activity)
    return response.data
  } catch (error) {
    console.error('Error adding company activity:', error)
    throw new Error('Falha ao adicionar atividade')
  }
}

// Bulk Operations
export async function updateCompaniesBulk(ids: string[], updates: Partial<UpdateCompanyData>): Promise<Company[]> {
  try {
    const response = await apiClient.put(`${COMPANIES_ENDPOINT}/bulk`, { ids, updates })
    return response.data
  } catch (error) {
    console.error('Error updating companies in bulk:', error)
    throw new Error('Falha ao atualizar empresas em lote')
  }
}

export async function deleteCompaniesBulk(ids: string[]): Promise<void> {
  try {
    await apiClient.delete(`${COMPANIES_ENDPOINT}/bulk`, { data: { ids } })
  } catch (error) {
    console.error('Error deleting companies in bulk:', error)
    throw new Error('Falha ao deletar empresas em lote')
  }
}

// Import/Export
export async function importCompanies(file: File): Promise<CompanyImportResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error importing companies:', error)
    throw new Error('Falha ao importar empresas')
  }
}

export async function exportCompanies(filters: CompanyFilters = {}): Promise<Blob> {
  try {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v))
      } else if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const queryString = params.toString()
    const url = queryString ? `${COMPANIES_ENDPOINT}/export?${queryString}` : `${COMPANIES_ENDPOINT}/export`

    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting companies:', error)
    throw new Error('Falha ao exportar empresas')
  }
}

// Company Enrichment
export async function enrichCompany(request: CompanyEnrichmentRequest): Promise<CompanyEnrichmentResult> {
  try {
    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/enrich`, request)
    return response.data
  } catch (error) {
    console.error('Error enriching company:', error)
    throw new Error('Falha ao enriquecer dados da empresa')
  }
}

export async function enrichCompaniesBulk(companyIds: string[]): Promise<CompanyEnrichmentResult[]> {
  try {
    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/enrich/bulk`, { companyIds })
    return response.data
  } catch (error) {
    console.error('Error enriching companies in bulk:', error)
    throw new Error('Falha ao enriquecer empresas em lote')
  }
}

// Company Search and Suggestions
export async function searchCompanies(query: string, limit = 10): Promise<Company[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString()
    })

    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/search?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error searching companies:', error)
    throw new Error('Falha ao pesquisar empresas')
  }
}

export async function getCompanySuggestions(partialName: string, limit = 5): Promise<Array<{ id: string; nome: string; cnpj?: string }>> {
  try {
    const params = new URLSearchParams({
      name: partialName,
      limit: limit.toString()
    })

    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/suggestions?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error getting company suggestions:', error)
    throw new Error('Falha ao buscar sugestões de empresas')
  }
}

// Company Duplicate Management
export async function findDuplicateCompanies(companyId?: string): Promise<Array<{ companies: Company[]; similarity: number }>> {
  try {
    const params = companyId ? `?companyId=${companyId}` : ''
    const response = await apiClient.get(`${COMPANIES_ENDPOINT}/duplicates${params}`)
    return response.data
  } catch (error) {
    console.error('Error finding duplicate companies:', error)
    throw new Error('Falha ao buscar empresas duplicadas')
  }
}

export async function mergeCompanies(primaryCompanyId: string, duplicateCompanyIds: string[]): Promise<Company> {
  try {
    const response = await apiClient.post(`${COMPANIES_ENDPOINT}/merge`, {
      primaryCompanyId,
      duplicateCompanyIds
    })
    return response.data
  } catch (error) {
    console.error('Error merging companies:', error)
    throw new Error('Falha ao mesclar empresas')
  }
}