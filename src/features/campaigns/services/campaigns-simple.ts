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

const CAMPAIGNS_ENDPOINT = '/api/campaigns'
const CAMPANHA_ENDPOINT = '/campanha'

// Essential Campaign CRUD Operations - Using correct apiClient.request syntax
export async function fetchCampaigns(filters: CampaignFilters = {}): Promise<CampaignsResponse> {
  try {
    console.log('fetchCampaigns called with filters:', filters)

    // Mock data para demonstração
    const mockResponse: CampaignsResponse = {
      campaigns: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false
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

// Placeholder functions for other operations (to prevent import errors)
// These can be implemented later when needed

export async function fetchCampaignExecutions(): Promise<any[]> {
  return []
}

export async function fetchCampaignAnalytics(): Promise<any> {
  return null
}

export async function fetchCampaignTemplates(): Promise<any[]> {
  return []
}

export async function createCampaignFromTemplate(): Promise<Campaign | null> {
  return null
}

export async function cloneCampaign(): Promise<Campaign | null> {
  return null
}

export async function bulkUpdateCampaigns(): Promise<Campaign[]> {
  return []
}

export async function bulkDeleteCampaigns(): Promise<void> {
  return
}

export async function importCampaignData(): Promise<any> {
  return null
}

export async function exportCampaignData(): Promise<Blob | null> {
  return null
}

export async function fetchCampaignIntegrations(): Promise<any[]> {
  return []
}

export async function createCampaignIntegration(): Promise<any> {
  return null
}

export async function fetchCampaignVariants(): Promise<any[]> {
  return []
}

export async function createCampaignVariant(): Promise<any> {
  return null
}

export async function selectWinnerVariant(): Promise<any> {
  return null
}

export async function testCampaign(): Promise<any> {
  return null
}