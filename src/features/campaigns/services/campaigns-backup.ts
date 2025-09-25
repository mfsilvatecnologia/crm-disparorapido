// Campaign Services - API integration for campaign management
import { apiClient } from '@/shared/services/client'
import type {
  Campaign,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignsResponse,
  CampaignStats,
  CampaignExecution,
  CampaignContact,
  CampaignTemplate,
  CampaignAnalytics,
  CampaignImportResult,
  CampaignIntegration,
  CampaignVariant,
  AddContactsToCampaignRequest,
  AddContactsToCampaignResponse,
  ListCampaignContactsResponse,
  CampaignContactsParams
} from '../types/campaigns'

const CAMPAIGNS_ENDPOINT = '/api/v1/campanha'
const CAMPANHA_ENDPOINT = '/campanha'

// Campaign CRUD Operations
export async function fetchCampaigns(filters: CampaignFilters = {}): Promise<CampaignsResponse> {
  try {
    // Criar mock de resposta até implementar a API real
    console.log('fetchCampaigns called with filters:', filters)

    // Mock data para demonstração
    const mockResponse: CampaignsResponse = {
      campaigns: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1
    }

    return mockResponse
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    throw new Error('Falha ao buscar campanhas')
  }
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}`)
    return response
  } catch (error) {
    console.error('Error fetching campaign:', error)
    throw new Error('Falha ao buscar campanha')
  }
}

export async function createCampaign(data: CreateCampaignData): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(CAMPAIGNS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response
  } catch (error) {
    console.error('Error creating campaign:', error)
    throw new Error('Falha ao criar campanha')
  }
}

export async function updateCampaign(data: UpdateCampaignData): Promise<Campaign> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
    return response
  } catch (error) {
    console.error('Error updating campaign:', error)
    throw new Error('Falha ao atualizar campanha')
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  try {
    await apiClient.request(`${CAMPAIGNS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    throw new Error('Falha ao deletar campanha')
  }
}

// Campaign Actions
export async function startCampaign(id: string): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}/start`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    console.error('Error starting campaign:', error)
    throw new Error('Falha ao iniciar campanha')
  }
}

export async function pauseCampaign(id: string): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}/pause`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    console.error('Error pausing campaign:', error)
    throw new Error('Falha ao pausar campanha')
  }
}

export async function resumeCampaign(id: string): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}/resume`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    console.error('Error resuming campaign:', error)
    throw new Error('Falha ao retomar campanha')
  }
}

export async function stopCampaign(id: string): Promise<Campaign> {
  try {
    const response = await apiClient.request<Campaign>(`${CAMPAIGNS_ENDPOINT}/${id}/stop`, {
      method: 'POST'
    })
    return response
  } catch (error) {
    console.error('Error stopping campaign:', error)
    throw new Error('Falha ao parar campanha')
  }
}

// Campaign Statistics
export async function fetchCampaignStats(filters?: Partial<CampaignFilters>): Promise<CampaignStats> {
  try {
    console.log('fetchCampaignStats called with filters:', filters)

    // Mock data para demonstração
    const mockStats: CampaignStats = {
      totalCampanhas: 0,
      campanhasAtivas: 0,
      campanhasPausadas: 0,
      campanhasFinalizadas: 0,
      totalContatos: 0,
      totalEnviados: 0,
      totalAbertos: 0,
      totalCliques: 0,
      totalConversoes: 0,
      taxaAbertura: 0,
      taxaCliques: 0,
      taxaConversao: 0,
      custoTotal: 0,
      roiTotal: 0,
      campanhasMaisPerformantes: [],
      evolucaoMensal: []
    }

    return mockStats
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    throw new Error('Falha ao buscar estatísticas de campanhas')
  }
}

// Campaign Analytics
export async function fetchCampaignAnalytics(campaignId: string, startDate: string, endDate: string): Promise<CampaignAnalytics> {
  try {
    const params = new URLSearchParams({
      startDate,
      endDate
    })

    const response = await apiClient.get(`${CAMPAIGNS_ENDPOINT}/${campaignId}/analytics?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign analytics:', error)
    throw new Error('Falha ao buscar analytics da campanha')
  }
}

// Campaign Contacts - usando endpoints do swagger
export async function fetchCampaignContacts(
  campaignId: string, 
  params?: CampaignContactsParams
): Promise<CampaignContact[]> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.ordering_strategy) {
      queryParams.append('ordering_strategy', params.ordering_strategy)
    }
    
    const endpoint = `${CAMPANHA_ENDPOINT}/${campaignId}/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.request<ListCampaignContactsResponse>(endpoint)
    
    return response.data
  } catch (error) {
    console.error('Error fetching campaign contacts:', error)
    throw new Error('Falha ao buscar contatos da campanha')
  }
}

export async function addContactsToCampaign(
  campaignId: string, 
  contactIds: string[]
): Promise<CampaignContact[]> {
  try {
    const requestData: AddContactsToCampaignRequest = {
      contact_ids: contactIds
    }
    
    const response = await apiClient.request<AddContactsToCampaignResponse>(
      `${CAMPANHA_ENDPOINT}/${campaignId}/contacts`,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Error adding contacts to campaign:', error)
    throw new Error('Falha ao adicionar contatos à campanha')
  }
}

export async function removeContactFromCampaign(
  campaignId: string, 
  contactId: string
): Promise<void> {
  try {
    await apiClient.request(
      `${CAMPANHA_ENDPOINT}/${campaignId}/contacts/${contactId}`,
      {
        method: 'DELETE'
      }
    )
  } catch (error) {
    console.error('Error removing contact from campaign:', error)
    throw new Error('Falha ao remover contato da campanha')
  }
}

export async function pauseContactInCampaign(campaignId: string, contactId: string): Promise<CampaignContact> {
  try {
    const response = await apiClient.request<CampaignContact>(
      `${CAMPANHA_ENDPOINT}/${campaignId}/contacts/${contactId}/pause`,
      {
        method: 'POST'
      }
    )
    return response
  } catch (error) {
    console.error('Error pausing contact in campaign:', error)
    throw new Error('Falha ao pausar contato na campanha')
  }
}

// Campaign Executions
export async function fetchCampaignExecutions(campaignId: string, filters?: { status?: string; limit?: number }): Promise<CampaignExecution[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit.toString())

    const queryString = params.toString()
    const url = queryString
      ? `${CAMPAIGNS_ENDPOINT}/${campaignId}/executions?${queryString}`
      : `${CAMPAIGNS_ENDPOINT}/${campaignId}/executions`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign executions:', error)
    throw new Error('Falha ao buscar execuções da campanha')
  }
}

// Campaign Templates
export async function fetchCampaignTemplates(filters?: { tipo?: string; categoria?: string }): Promise<CampaignTemplate[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.tipo) params.append('tipo', filters.tipo)
    if (filters?.categoria) params.append('categoria', filters.categoria)

    const queryString = params.toString()
    const url = queryString ? `${CAMPAIGNS_ENDPOINT}/templates?${queryString}` : `${CAMPAIGNS_ENDPOINT}/templates`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign templates:', error)
    throw new Error('Falha ao buscar templates de campanha')
  }
}

export async function createCampaignFromTemplate(templateId: string, campaignData: Partial<CreateCampaignData>): Promise<Campaign> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/templates/${templateId}/create`, campaignData)
    return response.data
  } catch (error) {
    console.error('Error creating campaign from template:', error)
    throw new Error('Falha ao criar campanha a partir do template')
  }
}

// Campaign Cloning
export async function cloneCampaign(campaignId: string, newName: string): Promise<Campaign> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/${campaignId}/clone`, { nome: newName })
    return response.data
  } catch (error) {
    console.error('Error cloning campaign:', error)
    throw new Error('Falha ao clonar campanha')
  }
}

// Bulk Operations
export async function updateCampaignsBulk(ids: string[], updates: Partial<UpdateCampaignData>): Promise<Campaign[]> {
  try {
    const response = await apiClient.put(`${CAMPAIGNS_ENDPOINT}/bulk`, { ids, updates })
    return response.data
  } catch (error) {
    console.error('Error updating campaigns in bulk:', error)
    throw new Error('Falha ao atualizar campanhas em lote')
  }
}

export async function deleteCampaignsBulk(ids: string[]): Promise<void> {
  try {
    await apiClient.delete(`${CAMPAIGNS_ENDPOINT}/bulk`, { data: { ids } })
  } catch (error) {
    console.error('Error deleting campaigns in bulk:', error)
    throw new Error('Falha ao deletar campanhas em lote')
  }
}

// Import/Export
export async function importCampaigns(file: File): Promise<CampaignImportResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error importing campaigns:', error)
    throw new Error('Falha ao importar campanhas')
  }
}

export async function exportCampaigns(filters: CampaignFilters = {}): Promise<Blob> {
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
    const url = queryString ? `${CAMPAIGNS_ENDPOINT}/export?${queryString}` : `${CAMPAIGNS_ENDPOINT}/export`

    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting campaigns:', error)
    throw new Error('Falha ao exportar campanhas')
  }
}

// Campaign Integrations
export async function fetchCampaignIntegrations(campaignId: string): Promise<CampaignIntegration[]> {
  try {
    const response = await apiClient.get(`${CAMPAIGNS_ENDPOINT}/${campaignId}/integrations`)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign integrations:', error)
    throw new Error('Falha ao buscar integrações da campanha')
  }
}

export async function createCampaignIntegration(campaignId: string, integration: Omit<CampaignIntegration, 'id' | 'campaignId' | 'dataCriacao'>): Promise<CampaignIntegration> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/${campaignId}/integrations`, integration)
    return response.data
  } catch (error) {
    console.error('Error creating campaign integration:', error)
    throw new Error('Falha ao criar integração da campanha')
  }
}

// A/B Testing
export async function fetchCampaignVariants(campaignId: string): Promise<CampaignVariant[]> {
  try {
    const response = await apiClient.get(`${CAMPAIGNS_ENDPOINT}/${campaignId}/variants`)
    return response.data
  } catch (error) {
    console.error('Error fetching campaign variants:', error)
    throw new Error('Falha ao buscar variantes da campanha')
  }
}

export async function createCampaignVariant(campaignId: string, variant: Omit<CampaignVariant, 'id' | 'campaignId' | 'dataCriacao'>): Promise<CampaignVariant> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/${campaignId}/variants`, variant)
    return response.data
  } catch (error) {
    console.error('Error creating campaign variant:', error)
    throw new Error('Falha ao criar variante da campanha')
  }
}

export async function selectWinnerVariant(campaignId: string, variantId: string): Promise<Campaign> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/${campaignId}/variants/${variantId}/winner`)
    return response.data
  } catch (error) {
    console.error('Error selecting winner variant:', error)
    throw new Error('Falha ao selecionar variante vencedora')
  }
}

// Campaign Testing
export async function testCampaign(campaignId: string, testContacts: string[]): Promise<{ success: boolean; results: any[] }> {
  try {
    const response = await apiClient.post(`${CAMPAIGNS_ENDPOINT}/${campaignId}/test`, { testContacts })
    return response.data
  } catch (error) {
    console.error('Error testing campaign:', error)
    throw new Error('Falha ao testar campanha')
  }
}