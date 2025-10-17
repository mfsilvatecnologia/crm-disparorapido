// Lead Services - API integration for lead management
import { apiClient } from '@/shared/services/client'
import type {
  Lead,
  LeadFilters,
  CreateLeadData,
  UpdateLeadData,
  LeadsResponse,
  LeadStats,
  LeadActivity,
  ImportLeadData,
  ImportResult
} from '../types/leads'

const LEADS_ENDPOINT = '/api/v1/leads'

// Lead CRUD Operations
export async function fetchLeads(filters: LeadFilters = {}): Promise<LeadsResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters.origem?.length) {
      filters.origem.forEach(origem => params.append('origem', origem))
    }
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }
    if (filters.empresaId) params.append('empresaId', filters.empresaId)
    if (filters.campanhaId) params.append('campanhaId', filters.campanhaId)
    if (filters.dataInicio) params.append('dataInicio', filters.dataInicio)
    if (filters.dataFim) params.append('dataFim', filters.dataFim)
    if (filters.search) params.append('search', filters.search)
    if (filters.scoreMinimo) params.append('scoreMinimo', filters.scoreMinimo.toString())
    if (filters.scoreMaximo) params.append('scoreMaximo', filters.scoreMaximo.toString())

    const queryString = params.toString()
    const url = queryString ? `${LEADS_ENDPOINT}?${queryString}` : LEADS_ENDPOINT

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching leads:', error)
    throw new Error('Falha ao buscar leads')
  }
}

export async function fetchLead(id: string): Promise<Lead> {
  try {
    const response = await apiClient.get(`${LEADS_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching lead:', error)
    throw new Error('Falha ao buscar lead')
  }
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  try {
    const response = await apiClient.post(LEADS_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating lead:', error)
    throw new Error('Falha ao criar lead')
  }
}

export async function updateLead(data: UpdateLeadData): Promise<Lead> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${LEADS_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating lead:', error)
    throw new Error('Falha ao atualizar lead')
  }
}

export async function deleteLead(id: string): Promise<void> {
  try {
    await apiClient.delete(`${LEADS_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting lead:', error)
    throw new Error('Falha ao deletar lead')
  }
}

// Lead Statistics
export async function fetchLeadStats(filters?: Partial<LeadFilters>): Promise<LeadStats> {
  try {
    const params = new URLSearchParams()
    if (filters?.empresaId) params.append('empresaId', filters.empresaId)
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio)
    if (filters?.dataFim) params.append('dataFim', filters.dataFim)

    const queryString = params.toString()
    const url = queryString ? `${LEADS_ENDPOINT}/stats?${queryString}` : `${LEADS_ENDPOINT}/stats`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching lead stats:', error)
    throw new Error('Falha ao buscar estatísticas de leads')
  }
}

// Lead Activities
export async function fetchLeadActivities(leadId: string): Promise<LeadActivity[]> {
  try {
    const response = await apiClient.get(`${LEADS_ENDPOINT}/${leadId}/activities`)
    return response.data
  } catch (error) {
    console.error('Error fetching lead activities:', error)
    throw new Error('Falha ao buscar atividades do lead')
  }
}

export async function addLeadActivity(leadId: string, activity: Omit<LeadActivity, 'id' | 'leadId' | 'data'>): Promise<LeadActivity> {
  try {
    const response = await apiClient.post(`${LEADS_ENDPOINT}/${leadId}/activities`, activity)
    return response.data
  } catch (error) {
    console.error('Error adding lead activity:', error)
    throw new Error('Falha ao adicionar atividade')
  }
}

// Bulk Operations
export async function updateLeadsBulk(ids: string[], updates: Partial<UpdateLeadData>): Promise<Lead[]> {
  try {
    const response = await apiClient.put(`${LEADS_ENDPOINT}/bulk`, { ids, updates })
    return response.data
  } catch (error) {
    console.error('Error updating leads in bulk:', error)
    throw new Error('Falha ao atualizar leads em lote')
  }
}

export async function deleteLeadsBulk(ids: string[]): Promise<void> {
  try {
    await apiClient.delete(`${LEADS_ENDPOINT}/bulk`, { data: { ids } })
  } catch (error) {
    console.error('Error deleting leads in bulk:', error)
    throw new Error('Falha ao deletar leads em lote')
  }
}

// Import/Export
export async function importLeads(file: File): Promise<ImportResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`${LEADS_ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error importing leads:', error)
    throw new Error('Falha ao importar leads')
  }
}

export async function exportLeads(filters: LeadFilters = {}): Promise<Blob> {
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
    const url = queryString ? `${LEADS_ENDPOINT}/export?${queryString}` : `${LEADS_ENDPOINT}/export`

    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting leads:', error)
    throw new Error('Falha ao exportar leads')
  }
}

// Lead Scoring
export async function updateLeadScore(id: string, score: number): Promise<Lead> {
  try {
    const response = await apiClient.put(`${LEADS_ENDPOINT}/${id}/score`, { score })
    return response.data
  } catch (error) {
    console.error('Error updating lead score:', error)
    throw new Error('Falha ao atualizar score do lead')
  }
}

export async function recalculateLeadScores(filters?: Partial<LeadFilters>): Promise<{ updated: number }> {
  try {
    const response = await apiClient.post(`${LEADS_ENDPOINT}/recalculate-scores`, filters)
    return response.data
  } catch (error) {
    console.error('Error recalculating lead scores:', error)
    throw new Error('Falha ao recalcular scores dos leads')
  }
}