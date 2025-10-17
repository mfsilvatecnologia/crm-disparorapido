// Simplified Campaign Services - Focusing on essential CRUD operations
import { apiClient } from '@/shared/services/client'
import type {
  Campaign,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignsResponse,
  CampaignStats,
  CampaignContact,
  AddContactsToCampaignRequest,
  AddContactsToCampaignResponse,
  ListCampaignContactsResponse,
  CampaignContactsParams
} from '../types/campaigns'

const CAMPAIGNS_ENDPOINT = '/api/v1/campanhas'

// Essential Campaign CRUD Operations - Using correct apiClient.request syntax
export async function fetchCampaigns(filters: CampaignFilters = {}): Promise<CampaignsResponse> {
  try {
    console.log('fetchCampaigns called with filters:', filters)

    const response = await apiClient.request<{ 
      success: boolean; 
      data: Campaign[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
        firstPage: number
        lastPage: number
      }
    }>(CAMPAIGNS_ENDPOINT, {
      method: 'GET',
    })

    console.log('Raw API response:', response)

    // A API retorna { success: true, data: [...], pagination: {...} }
    const campaigns = response.data || []
    const pagination = response.pagination
    const total = pagination?.total || 0
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const totalPages = pagination?.totalPages || 1
    
    console.log('Extracted campaigns:', campaigns)
    console.log('Pagination info:', { total, page, limit, totalPages })
    
    const campaignsResponse: CampaignsResponse = {
      campaigns,
      total,
      page,
      limit,
      hasMore: page < totalPages
    }

    console.log('Final campaigns response:', campaignsResponse)
    return campaignsResponse
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
    const response = await apiClient.request<{ success: boolean; data: Campaign }>(CAMPAIGNS_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    
    // A API retorna { success: true, data: Campaign }
    return response.data
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

export async function deleteCampaign(id: string, force: boolean = false): Promise<void> {
  try {
    // Verificar se existem contatos associados à campanha, a menos que seja forçado
    if (!force) {
      const contacts = await fetchCampaignContacts(id)
      if (contacts.length > 0) {
        throw new Error(`Não é possível excluir a campanha pois ela possui ${contacts.length} contato(s) associado(s). Remova os contatos primeiro ou force a exclusão.`)
      }
    }

    await apiClient.request(`${CAMPAIGNS_ENDPOINT}/${id}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    if (error instanceof Error) {
      throw error
    }
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

// Campaign Statistics - Mock implementation
export async function fetchCampaignStats(filters?: Partial<CampaignFilters>): Promise<CampaignStats> {
  try {
    console.log('fetchCampaignStats called with filters:', filters)

    // Mock data para desenvolvimento
    const mockStats: CampaignStats = {
      total: 0,
      ativas: 0,
      pausadas: 0,
      concluidas: 0,
      rascunhos: 0,
      porTipo: [],
      performanceGeral: {
        totalContatos: 0,
        taxaAberturaMedia: 0,
        taxaClickeMedia: 0,
        taxaConversaoMedia: 0,
        roiMedio: 0,
        valorTotalVendas: 0,
      },
      topPerformers: []
    }

    return mockStats
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    throw new Error('Falha ao buscar estatísticas das campanhas')
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
    
    const endpoint = `${CAMPAIGNS_ENDPOINT}/${campaignId}/contacts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
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
      `${CAMPAIGNS_ENDPOINT}/${campaignId}/contacts`,
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
      `${CAMPAIGNS_ENDPOINT}/${campaignId}/contacts/${contactId}`,
      {
        method: 'DELETE'
      }
    )
  } catch (error) {
    console.error('Error removing contact from campaign:', error)
    throw new Error('Falha ao remover contato da campanha')
  }
}

// Additional Campaign Actions
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

// Placeholder functions for other operations (to prevent import errors)
// These can be implemented later when needed

export async function fetchCampaignExecutions(campaignId: string, filters?: any): Promise<any[]> {
  console.log('fetchCampaignExecutions called', { campaignId, filters })
  return []
}

export async function fetchCampaignAnalytics(campaignId: string, startDate?: string, endDate?: string): Promise<any> {
  console.log('fetchCampaignAnalytics called', { campaignId, startDate, endDate })
  return null
}

export async function fetchCampaignTemplates(filters?: any): Promise<any[]> {
  console.log('fetchCampaignTemplates called', { filters })
  return []
}

export async function createCampaignFromTemplate(templateId: string, data: any): Promise<Campaign | null> {
  console.log('createCampaignFromTemplate called', { templateId, data })
  return null
}

export async function cloneCampaign(campaignId: string, newName: string): Promise<Campaign | null> {
  console.log('cloneCampaign called', { campaignId, newName })
  return null
}

export async function updateCampaignsBulk(ids: string[], updates: any): Promise<Campaign[]> {
  console.log('updateCampaignsBulk called', { ids, updates })
  return []
}

export async function deleteCampaignsBulk(ids: string[]): Promise<void> {
  console.log('deleteCampaignsBulk called', { ids })
  return
}

export async function importCampaignData(data: any): Promise<any> {
  console.log('importCampaignData called', { data })
  return null
}

export async function exportCampaignData(filters?: any): Promise<Blob | null> {
  console.log('exportCampaignData called', { filters })
  return null
}

export async function fetchCampaignIntegrations(campaignId: string): Promise<any[]> {
  console.log('fetchCampaignIntegrations called', { campaignId })
  return []
}

export async function createCampaignIntegration(campaignId: string, integration: any): Promise<any> {
  console.log('createCampaignIntegration called', { campaignId, integration })
  return null
}

export async function fetchCampaignVariants(campaignId: string): Promise<any[]> {
  console.log('fetchCampaignVariants called', { campaignId })
  return []
}

export async function createCampaignVariant(campaignId: string, variant: any): Promise<any> {
  console.log('createCampaignVariant called', { campaignId, variant })
  return null
}

export async function selectWinnerVariant(campaignId: string, variantId: string): Promise<any> {
  console.log('selectWinnerVariant called', { campaignId, variantId })
  return null
}

export async function testCampaign(campaignId: string, testContacts: string[]): Promise<any> {
  console.log('testCampaign called', { campaignId, testContacts })
  return null
}