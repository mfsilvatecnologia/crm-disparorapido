// Pipeline Services - API integration for sales pipeline management
import { apiClient } from '@/shared/services/client'
import type {
  Deal,
  PipelineStage,
  DealActivity,
  PipelineFilters,
  CreateDealData,
  UpdateDealData,
  DealsResponse,
  PipelineStats,
  CreateStageData,
  UpdateStageData,
  StagesResponse,
  DealMove,
  CreateActivityData,
  UpdateActivityData,
  ActivitiesResponse,
  PipelineDashboard,
  PipelineForecast
} from '../types/pipeline'

const DEALS_ENDPOINT = '/api/deals'
const STAGES_ENDPOINT = '/api/pipeline-stages'
const ACTIVITIES_ENDPOINT = '/api/deal-activities'

// Deal CRUD Operations
export async function fetchDeals(filters: PipelineFilters = {}): Promise<DealsResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.stageId?.length) {
      filters.stageId.forEach(id => params.append('stageId', id))
    }
    if (filters.responsavelId?.length) {
      filters.responsavelId.forEach(id => params.append('responsavelId', id))
    }
    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters.prioridade?.length) {
      filters.prioridade.forEach(prioridade => params.append('prioridade', prioridade))
    }
    if (filters.origem?.length) {
      filters.origem.forEach(origem => params.append('origem', origem))
    }
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag))
    }
    if (filters.valorMin !== undefined) params.append('valorMin', filters.valorMin.toString())
    if (filters.valorMax !== undefined) params.append('valorMax', filters.valorMax.toString())
    if (filters.probabilidadeMin !== undefined) params.append('probabilidadeMin', filters.probabilidadeMin.toString())
    if (filters.probabilidadeMax !== undefined) params.append('probabilidadeMax', filters.probabilidadeMax.toString())
    if (filters.dataInicioMin) params.append('dataInicioMin', filters.dataInicioMin)
    if (filters.dataInicioMax) params.append('dataInicioMax', filters.dataInicioMax)
    if (filters.dataFechamentoMin) params.append('dataFechamentoMin', filters.dataFechamentoMin)
    if (filters.dataFechamentoMax) params.append('dataFechamentoMax', filters.dataFechamentoMax)
    if (filters.search) params.append('search', filters.search)
    if (filters.temNoStageMin !== undefined) params.append('temNoStageMin', filters.temNoStageMin.toString())
    if (filters.temNoStageMax !== undefined) params.append('temNoStageMax', filters.temNoStageMax.toString())

    const queryString = params.toString()
    const url = queryString ? `${DEALS_ENDPOINT}?${queryString}` : DEALS_ENDPOINT

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching deals:', error)
    throw new Error('Falha ao buscar negócios')
  }
}

export async function fetchDeal(id: string): Promise<Deal> {
  try {
    const response = await apiClient.get(`${DEALS_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching deal:', error)
    throw new Error('Falha ao buscar negócio')
  }
}

export async function createDeal(data: CreateDealData): Promise<Deal> {
  try {
    const response = await apiClient.post(DEALS_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating deal:', error)
    throw new Error('Falha ao criar negócio')
  }
}

export async function updateDeal(data: UpdateDealData): Promise<Deal> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${DEALS_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating deal:', error)
    throw new Error('Falha ao atualizar negócio')
  }
}

export async function deleteDeal(id: string): Promise<void> {
  try {
    await apiClient.delete(`${DEALS_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting deal:', error)
    throw new Error('Falha ao deletar negócio')
  }
}

// Deal Movement
export async function moveDeal(moveData: DealMove): Promise<Deal> {
  try {
    const response = await apiClient.post(`${DEALS_ENDPOINT}/${moveData.dealId}/move`, {
      toStageId: moveData.toStageId,
      reason: moveData.reason,
      notes: moveData.notes
    })
    return response.data
  } catch (error) {
    console.error('Error moving deal:', error)
    throw new Error('Falha ao mover negócio')
  }
}

export async function convertLeadToDeal(leadId: string, dealData: Partial<CreateDealData>): Promise<Deal> {
  try {
    const response = await apiClient.post(`${DEALS_ENDPOINT}/from-lead/${leadId}`, dealData)
    return response.data
  } catch (error) {
    console.error('Error converting lead to deal:', error)
    throw new Error('Falha ao converter lead em negócio')
  }
}

// Pipeline Stages
export async function fetchStages(): Promise<StagesResponse> {
  try {
    const response = await apiClient.get(STAGES_ENDPOINT)
    return response.data
  } catch (error) {
    console.error('Error fetching stages:', error)
    throw new Error('Falha ao buscar etapas do pipeline')
  }
}

export async function fetchStage(id: string): Promise<PipelineStage> {
  try {
    const response = await apiClient.get(`${STAGES_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching stage:', error)
    throw new Error('Falha ao buscar etapa')
  }
}

export async function createStage(data: CreateStageData): Promise<PipelineStage> {
  try {
    const response = await apiClient.post(STAGES_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating stage:', error)
    throw new Error('Falha ao criar etapa')
  }
}

export async function updateStage(data: UpdateStageData): Promise<PipelineStage> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${STAGES_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating stage:', error)
    throw new Error('Falha ao atualizar etapa')
  }
}

export async function deleteStage(id: string): Promise<void> {
  try {
    await apiClient.delete(`${STAGES_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting stage:', error)
    throw new Error('Falha ao deletar etapa')
  }
}

export async function reorderStages(stageIds: string[]): Promise<PipelineStage[]> {
  try {
    const response = await apiClient.post(`${STAGES_ENDPOINT}/reorder`, { stageIds })
    return response.data
  } catch (error) {
    console.error('Error reordering stages:', error)
    throw new Error('Falha ao reordenar etapas')
  }
}

// Deal Activities
export async function fetchDealActivities(dealId: string, page = 1, limit = 20): Promise<ActivitiesResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiClient.get(`${DEALS_ENDPOINT}/${dealId}/activities?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching deal activities:', error)
    throw new Error('Falha ao buscar atividades do negócio')
  }
}

export async function createDealActivity(data: CreateActivityData): Promise<DealActivity> {
  try {
    const response = await apiClient.post(ACTIVITIES_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating activity:', error)
    throw new Error('Falha ao criar atividade')
  }
}

export async function updateDealActivity(data: UpdateActivityData): Promise<DealActivity> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${ACTIVITIES_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating activity:', error)
    throw new Error('Falha ao atualizar atividade')
  }
}

export async function deleteDealActivity(id: string): Promise<void> {
  try {
    await apiClient.delete(`${ACTIVITIES_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting activity:', error)
    throw new Error('Falha ao deletar atividade')
  }
}

export async function completeDealActivity(id: string, resultado?: 'positivo' | 'neutro' | 'negativo', notes?: string): Promise<DealActivity> {
  try {
    const response = await apiClient.post(`${ACTIVITIES_ENDPOINT}/${id}/complete`, { resultado, notes })
    return response.data
  } catch (error) {
    console.error('Error completing activity:', error)
    throw new Error('Falha ao completar atividade')
  }
}

// Pipeline Statistics
export async function fetchPipelineStats(filters?: Partial<PipelineFilters>): Promise<PipelineStats> {
  try {
    const params = new URLSearchParams()
    if (filters?.responsavelId?.length) {
      filters.responsavelId.forEach(id => params.append('responsavelId', id))
    }
    if (filters?.dataInicioMin) params.append('dataInicioMin', filters.dataInicioMin)
    if (filters?.dataInicioMax) params.append('dataInicioMax', filters.dataInicioMax)

    const queryString = params.toString()
    const url = queryString ? `${DEALS_ENDPOINT}/stats?${queryString}` : `${DEALS_ENDPOINT}/stats`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching pipeline stats:', error)
    throw new Error('Falha ao buscar estatísticas do pipeline')
  }
}

// Pipeline Dashboard
export async function fetchPipelineDashboard(): Promise<PipelineDashboard> {
  try {
    const response = await apiClient.get(`${DEALS_ENDPOINT}/dashboard`)
    return response.data
  } catch (error) {
    console.error('Error fetching pipeline dashboard:', error)
    throw new Error('Falha ao buscar dashboard do pipeline')
  }
}

// Pipeline Forecast
export async function fetchPipelineForecast(periodoMeses = 3): Promise<PipelineForecast> {
  try {
    const params = new URLSearchParams({
      periodo: periodoMeses.toString()
    })

    const response = await apiClient.get(`${DEALS_ENDPOINT}/forecast?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching pipeline forecast:', error)
    throw new Error('Falha ao buscar previsão do pipeline')
  }
}

// Bulk Operations
export async function updateDealsBulk(dealIds: string[], updates: Partial<UpdateDealData>): Promise<Deal[]> {
  try {
    const response = await apiClient.put(`${DEALS_ENDPOINT}/bulk`, { dealIds, updates })
    return response.data
  } catch (error) {
    console.error('Error updating deals in bulk:', error)
    throw new Error('Falha ao atualizar negócios em lote')
  }
}

export async function deleteDealsBulk(dealIds: string[]): Promise<void> {
  try {
    await apiClient.delete(`${DEALS_ENDPOINT}/bulk`, { data: { dealIds } })
  } catch (error) {
    console.error('Error deleting deals in bulk:', error)
    throw new Error('Falha ao deletar negócios em lote')
  }
}

// Import/Export
export async function importDeals(file: File): Promise<{ success: number; errors: number; details: any[] }> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`${DEALS_ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error importing deals:', error)
    throw new Error('Falha ao importar negócios')
  }
}

export async function exportDeals(filters: PipelineFilters = {}): Promise<Blob> {
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
    const url = queryString ? `${DEALS_ENDPOINT}/export?${queryString}` : `${DEALS_ENDPOINT}/export`

    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting deals:', error)
    throw new Error('Falha ao exportar negócios')
  }
}

// Pipeline Templates
export async function createDealFromTemplate(templateId: string, dealData: Partial<CreateDealData>): Promise<Deal> {
  try {
    const response = await apiClient.post(`${DEALS_ENDPOINT}/from-template/${templateId}`, dealData)
    return response.data
  } catch (error) {
    console.error('Error creating deal from template:', error)
    throw new Error('Falha ao criar negócio a partir do template')
  }
}

// Reports
export async function fetchDealWinLossReport(filters?: Partial<PipelineFilters>): Promise<{
  wonDeals: Deal[]
  lostDeals: Deal[]
  winRate: number
  avgDealSize: number
  avgSalesCycle: number
  topLossReasons: Array<{ reason: string; count: number }>
}> {
  try {
    const params = new URLSearchParams()
    if (filters?.dataFechamentoMin) params.append('dataFechamentoMin', filters.dataFechamentoMin)
    if (filters?.dataFechamentoMax) params.append('dataFechamentoMax', filters.dataFechamentoMax)
    if (filters?.responsavelId?.length) {
      filters.responsavelId.forEach(id => params.append('responsavelId', id))
    }

    const queryString = params.toString()
    const url = queryString ? `${DEALS_ENDPOINT}/reports/win-loss?${queryString}` : `${DEALS_ENDPOINT}/reports/win-loss`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching win/loss report:', error)
    throw new Error('Falha ao buscar relatório de ganhos e perdas')
  }
}