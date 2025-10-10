import { apiClient } from '@/shared/services/client'
import type {
  CampaignLeadStage,
  CreateStageRequest,
  UpdateStageRequest,
  TransitionLeadRequest,
  TransitionLeadResponse,
  BulkStageUpdateRequest,
  BulkStageUpdateResponse,
  CampaignContactStageHistory,
  FunnelMetrics,
  CampaignStageCharge,
  ChargeFilters,
  ChargesSummary,
  BillingConfiguration,
  UpdateBillingConfigRequest,
} from '../types'

const STAGES_ENDPOINT = '/api/v1/campaign-lead-stages'

export async function fetchCampaignStages(filters?: {
  includeInactive?: boolean
  categoria?: CampaignLeadStage['categoria']
}): Promise<CampaignLeadStage[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.includeInactive !== undefined) {
      queryParams.append('includeInactive', String(filters.includeInactive))
    }
    if (filters?.categoria) {
      queryParams.append('categoria', filters.categoria)
    }
    const query = queryParams.toString() ? `?${queryParams}` : ''
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage[]
      total: number
    }>(`${STAGES_ENDPOINT}${query}`, { method: 'GET' })
    return response.data
  } catch (error) {
    console.error('Error fetching campaign stages:', error)
    throw new Error('Falha ao buscar estágios da campanha')
  }
}

export async function fetchCampaignStage(stageId: string): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(`${STAGES_ENDPOINT}/${stageId}`, { method: 'GET' })
    return response.data
  } catch (error) {
    console.error('Error fetching campaign stage:', error)
    throw new Error('Falha ao buscar estágio')
  }
}

export async function createCampaignStage(data: CreateStageRequest): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(STAGES_ENDPOINT, { method: 'POST', body: JSON.stringify(data) })
    return response.data
  } catch (error) {
    console.error('Error creating campaign stage:', error)
    const message = (error as Error)?.message ?? ''
    if (message.includes('409')) {
      throw new Error('Nome duplicado ou múltiplos estágios iniciais')
    }
    if (message.includes('400')) {
      throw new Error('Dados inválidos. Verifique os campos obrigatórios.')
    }
    throw new Error('Falha ao criar estágio')
  }
}

export async function updateCampaignStage(stageId: string, data: UpdateStageRequest): Promise<CampaignLeadStage> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignLeadStage
    }>(`${STAGES_ENDPOINT}/${stageId}`, { method: 'PUT', body: JSON.stringify(data) })
    return response.data
  } catch (error) {
    console.error('Error updating campaign stage:', error)
    const message = (error as Error)?.message ?? ''
    if (message.includes('400')) {
      throw new Error('Não é permitido alterar categoria ou isInicial após criação')
    }
    if (message.includes('409')) {
      throw new Error('Nome duplicado')
    }
    throw new Error('Falha ao atualizar estágio')
  }
}

export async function deleteCampaignStage(stageId: string): Promise<void> {
  try {
    await apiClient.request<{ success: boolean; message: string }>(`${STAGES_ENDPOINT}/${stageId}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error('Error deleting campaign stage:', error)
    const message = (error as Error)?.message ?? ''
    if (message.includes('409')) {
      throw new Error('Não é possível deletar estágio com leads ativos')
    }
    throw new Error('Falha ao deletar estágio')
  }
}

export async function reorderCampaignStages(stages: Array<{ id: string; ordem: number }>): Promise<void> {
  try {
    await apiClient.request<{ success: boolean; message: string }>(`${STAGES_ENDPOINT}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ stages }),
    })
  } catch (error) {
    console.error('Error reordering campaign stages:', error)
    throw new Error('Falha ao reordenar estágios')
  }
}

export async function transitionLeadStage(
  campaignId: string,
  contactId: string,
  data: TransitionLeadRequest
): Promise<TransitionLeadResponse> {
  try {
    const response = await apiClient.request<TransitionLeadResponse>(
      `/api/v1/campaigns/${campaignId}/contacts/${contactId}/stage`,
      { method: 'PATCH', body: JSON.stringify(data) }
    )
    return response
  } catch (error) {
    console.error('Error transitioning lead stage:', error)
    throw new Error('Falha ao mover lead para novo estágio')
  }
}

export async function bulkUpdateLeadStages(
  campaignId: string,
  data: BulkStageUpdateRequest
): Promise<BulkStageUpdateResponse> {
  try {
    const response = await apiClient.request<BulkStageUpdateResponse>(
      `/api/v1/campaigns/${campaignId}/contacts/bulk-stage-update`,
      { method: 'POST', body: JSON.stringify(data) }
    )
    return response
  } catch (error) {
    console.error('Error bulk updating lead stages:', error)
    throw new Error('Falha ao atualizar leads em massa')
  }
}

export async function fetchLeadStageHistory(
  campaignId: string,
  contactId: string
): Promise<CampaignContactStageHistory[]> {
  try {
    const response = await apiClient.request<{
      success: boolean
      data: CampaignContactStageHistory[]
      total: number
    }>(`/api/v1/campaigns/${campaignId}/contacts/${contactId}/stage-history`, { method: 'GET' })
    return response.data
  } catch (error) {
    console.error('Error fetching lead stage history:', error)
    throw new Error('Falha ao buscar histórico de estágios')
  }
}

export async function fetchCampaignFunnelMetrics(campaignId: string): Promise<FunnelMetrics> {
  try {
    const response = await apiClient.request<{ success: boolean; data: FunnelMetrics }>(
      `/api/v1/campaigns/${campaignId}/funnel`,
      { method: 'GET' }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching funnel metrics:', error)
    throw new Error('Falha ao buscar métricas do funil')
  }
}

export async function fetchCampaignCharges(
  campaignId: string,
  filters?: ChargeFilters
): Promise<CampaignStageCharge[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    if (filters?.stageId) params.append('stageId', filters.stageId)
    if (typeof filters?.foiCobrado === 'boolean') params.append('foiCobrado', String(filters.foiCobrado))
    const query = params.toString() ? `?${params}` : ''
    const response = await apiClient.request<{
      success: boolean
      data: CampaignStageCharge[]
      total: number
    }>(`/api/v1/campaigns/${campaignId}/charges${query}`, { method: 'GET' })
    return response.data
  } catch (error) {
    console.error('Error fetching campaign charges:', error)
    throw new Error('Falha ao buscar cobranças')
  }
}

export async function fetchCampaignChargesSummary(campaignId: string): Promise<ChargesSummary> {
  try {
    const response = await apiClient.request<{ success: boolean; data: ChargesSummary }>(
      `/api/v1/campaigns/${campaignId}/charges/summary`,
      { method: 'GET' }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching charges summary:', error)
    throw new Error('Falha ao buscar resumo de cobranças')
  }
}

export async function fetchBillingConfiguration(): Promise<BillingConfiguration> {
  try {
    const response = await apiClient.request<{ success: boolean; data: BillingConfiguration }>(
      '/api/v1/empresa/configuracoes/cobranca',
      { method: 'GET' }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching billing configuration:', error)
    throw new Error('Falha ao buscar configurações de cobrança')
  }
}

export async function updateBillingConfiguration(
  data: UpdateBillingConfigRequest
): Promise<BillingConfiguration> {
  try {
    const response = await apiClient.request<{ success: boolean; data: BillingConfiguration }>(
      '/api/v1/empresa/configuracoes/cobranca',
      { method: 'PUT', body: JSON.stringify(data) }
    )
    return response.data
  } catch (error) {
    console.error('Error updating billing configuration:', error)
    throw new Error('Falha ao atualizar configurações de cobrança')
  }
}

