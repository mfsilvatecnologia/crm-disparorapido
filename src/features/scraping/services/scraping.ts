// Scraping Services - API integration for scraping and data collection
import { apiClient } from '@/shared/services/client'
import type {
  SearchTerm,
  ScrapingJob,
  WorkerStatus,
  ScrapingFilters,
  SearchTermFilters,
  CreateSearchTermData,
  UpdateSearchTermData,
  CreateScrapingJobData,
  ScrapingJobsResponse,
  SearchTermsResponse,
  ScrapingStats,
  ScrapingResult,
  ScrapingDashboard,
  ScrapingConfig,
  BulkImportResult
} from '../types/scraping'

const SEARCH_TERMS_ENDPOINT = '/api/search-terms'
const SCRAPING_JOBS_ENDPOINT = '/api/scraping-jobs'
const WORKER_ENDPOINT = '/api/scraping/worker'
const RESULTS_ENDPOINT = '/api/scraping/results'

// Search Terms CRUD
export async function fetchSearchTerms(filters: SearchTermFilters = {}): Promise<SearchTermsResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.categoria?.length) {
      filters.categoria.forEach(cat => params.append('categoria', cat))
    }
    if (filters.ativo !== undefined) params.append('ativo', filters.ativo.toString())
    if (filters.criadoPor?.length) {
      filters.criadoPor.forEach(user => params.append('criadoPor', user))
    }
    if (filters.temEstatisticas !== undefined) params.append('temEstatisticas', filters.temEstatisticas.toString())
    if (filters.search) params.append('search', filters.search)

    const queryString = params.toString()
    const url = queryString ? `${SEARCH_TERMS_ENDPOINT}?${queryString}` : SEARCH_TERMS_ENDPOINT

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching search terms:', error)
    throw new Error('Falha ao buscar termos de busca')
  }
}

export async function fetchSearchTerm(id: string): Promise<SearchTerm> {
  try {
    const response = await apiClient.get(`${SEARCH_TERMS_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching search term:', error)
    throw new Error('Falha ao buscar termo de busca')
  }
}

export async function createSearchTerm(data: CreateSearchTermData): Promise<SearchTerm> {
  try {
    const response = await apiClient.post(SEARCH_TERMS_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating search term:', error)
    throw new Error('Falha ao criar termo de busca')
  }
}

export async function updateSearchTerm(data: UpdateSearchTermData): Promise<SearchTerm> {
  try {
    const { id, ...updateData } = data
    const response = await apiClient.put(`${SEARCH_TERMS_ENDPOINT}/${id}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating search term:', error)
    throw new Error('Falha ao atualizar termo de busca')
  }
}

export async function deleteSearchTerm(id: string): Promise<void> {
  try {
    await apiClient.delete(`${SEARCH_TERMS_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting search term:', error)
    throw new Error('Falha ao deletar termo de busca')
  }
}

// Search Term Categories
export async function fetchSearchTermCategories(): Promise<string[]> {
  try {
    const response = await apiClient.get(`${SEARCH_TERMS_ENDPOINT}/categories`)
    return response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new Error('Falha ao buscar categorias')
  }
}

// Scraping Jobs CRUD
export async function fetchScrapingJobs(filters: ScrapingFilters = {}): Promise<ScrapingJobsResponse> {
  try {
    const params = new URLSearchParams()

    if (filters.status?.length) {
      filters.status.forEach(status => params.append('status', status))
    }
    if (filters.searchTermId?.length) {
      filters.searchTermId.forEach(id => params.append('searchTermId', id))
    }
    if (filters.criadoPor?.length) {
      filters.criadoPor.forEach(user => params.append('criadoPor', user))
    }
    if (filters.dataInicioMin) params.append('dataInicioMin', filters.dataInicioMin)
    if (filters.dataInicioMax) params.append('dataInicioMax', filters.dataInicioMax)
    if (filters.dataFimMin) params.append('dataFimMin', filters.dataFimMin)
    if (filters.dataFimMax) params.append('dataFimMax', filters.dataFimMax)
    if (filters.temResultados !== undefined) params.append('temResultados', filters.temResultados.toString())
    if (filters.search) params.append('search', filters.search)

    const queryString = params.toString()
    const url = queryString ? `${SCRAPING_JOBS_ENDPOINT}?${queryString}` : SCRAPING_JOBS_ENDPOINT

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping jobs:', error)
    throw new Error('Falha ao buscar jobs de scraping')
  }
}

export async function fetchScrapingJob(id: string): Promise<ScrapingJob> {
  try {
    const response = await apiClient.get(`${SCRAPING_JOBS_ENDPOINT}/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping job:', error)
    throw new Error('Falha ao buscar job de scraping')
  }
}

export async function createScrapingJob(data: CreateScrapingJobData): Promise<ScrapingJob> {
  try {
    const response = await apiClient.post(SCRAPING_JOBS_ENDPOINT, data)
    return response.data
  } catch (error) {
    console.error('Error creating scraping job:', error)
    throw new Error('Falha ao criar job de scraping')
  }
}

export async function cancelScrapingJob(id: string): Promise<ScrapingJob> {
  try {
    const response = await apiClient.post(`${SCRAPING_JOBS_ENDPOINT}/${id}/cancel`)
    return response.data
  } catch (error) {
    console.error('Error cancelling scraping job:', error)
    throw new Error('Falha ao cancelar job de scraping')
  }
}

export async function retryScrapingJob(id: string): Promise<ScrapingJob> {
  try {
    const response = await apiClient.post(`${SCRAPING_JOBS_ENDPOINT}/${id}/retry`)
    return response.data
  } catch (error) {
    console.error('Error retrying scraping job:', error)
    throw new Error('Falha ao reiniciar job de scraping')
  }
}

export async function deleteScrapingJob(id: string): Promise<void> {
  try {
    await apiClient.delete(`${SCRAPING_JOBS_ENDPOINT}/${id}`)
  } catch (error) {
    console.error('Error deleting scraping job:', error)
    throw new Error('Falha ao deletar job de scraping')
  }
}

// Worker Management
export async function fetchWorkerStatus(): Promise<WorkerStatus> {
  try {
    const response = await apiClient.get(`${WORKER_ENDPOINT}/status`)
    return response.data
  } catch (error) {
    console.error('Error fetching worker status:', error)
    throw new Error('Falha ao buscar status do worker')
  }
}

export async function startWorker(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`${WORKER_ENDPOINT}/start`)
    return response.data
  } catch (error) {
    console.error('Error starting worker:', error)
    throw new Error('Falha ao iniciar worker')
  }
}

export async function stopWorker(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`${WORKER_ENDPOINT}/stop`)
    return response.data
  } catch (error) {
    console.error('Error stopping worker:', error)
    throw new Error('Falha ao parar worker')
  }
}

export async function restartWorker(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.post(`${WORKER_ENDPOINT}/restart`)
    return response.data
  } catch (error) {
    console.error('Error restarting worker:', error)
    throw new Error('Falha ao reiniciar worker')
  }
}

// Scraping Results
export async function fetchScrapingResults(jobId: string, page = 1, limit = 50): Promise<{
  results: ScrapingResult[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await apiClient.get(`${SCRAPING_JOBS_ENDPOINT}/${jobId}/results?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping results:', error)
    throw new Error('Falha ao buscar resultados do scraping')
  }
}

export async function processScrapingResult(resultId: string, action: 'accept' | 'reject', reason?: string): Promise<ScrapingResult> {
  try {
    const response = await apiClient.post(`${RESULTS_ENDPOINT}/${resultId}/process`, { action, reason })
    return response.data
  } catch (error) {
    console.error('Error processing scraping result:', error)
    throw new Error('Falha ao processar resultado do scraping')
  }
}

export async function bulkProcessResults(resultIds: string[], action: 'accept' | 'reject', reason?: string): Promise<{ success: number; errors: number }> {
  try {
    const response = await apiClient.post(`${RESULTS_ENDPOINT}/bulk-process`, { resultIds, action, reason })
    return response.data
  } catch (error) {
    console.error('Error bulk processing results:', error)
    throw new Error('Falha ao processar resultados em lote')
  }
}

// Statistics
export async function fetchScrapingStats(filters?: Partial<ScrapingFilters>): Promise<ScrapingStats> {
  try {
    const params = new URLSearchParams()
    if (filters?.dataInicioMin) params.append('dataInicioMin', filters.dataInicioMin)
    if (filters?.dataInicioMax) params.append('dataInicioMax', filters.dataInicioMax)

    const queryString = params.toString()
    const url = queryString ? `${SCRAPING_JOBS_ENDPOINT}/stats?${queryString}` : `${SCRAPING_JOBS_ENDPOINT}/stats`

    const response = await apiClient.get(url)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping stats:', error)
    throw new Error('Falha ao buscar estatísticas de scraping')
  }
}

// Dashboard
export async function fetchScrapingDashboard(): Promise<ScrapingDashboard> {
  try {
    const response = await apiClient.get(`${SCRAPING_JOBS_ENDPOINT}/dashboard`)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping dashboard:', error)
    throw new Error('Falha ao buscar dashboard de scraping')
  }
}

// Configuration
export async function fetchScrapingConfig(): Promise<ScrapingConfig> {
  try {
    const response = await apiClient.get(`${WORKER_ENDPOINT}/config`)
    return response.data
  } catch (error) {
    console.error('Error fetching scraping config:', error)
    throw new Error('Falha ao buscar configuração de scraping')
  }
}

export async function updateScrapingConfig(config: Partial<ScrapingConfig>): Promise<ScrapingConfig> {
  try {
    const response = await apiClient.put(`${WORKER_ENDPOINT}/config`, config)
    return response.data
  } catch (error) {
    console.error('Error updating scraping config:', error)
    throw new Error('Falha ao atualizar configuração de scraping')
  }
}

// Bulk Operations
export async function bulkCreateJobs(searchTermIds: string[], parametros?: Partial<ScrapingJob['parametros']>): Promise<ScrapingJob[]> {
  try {
    const response = await apiClient.post(`${SCRAPING_JOBS_ENDPOINT}/bulk-create`, { searchTermIds, parametros })
    return response.data
  } catch (error) {
    console.error('Error bulk creating jobs:', error)
    throw new Error('Falha ao criar jobs em lote')
  }
}

export async function bulkCancelJobs(jobIds: string[]): Promise<{ success: number; errors: number }> {
  try {
    const response = await apiClient.post(`${SCRAPING_JOBS_ENDPOINT}/bulk-cancel`, { jobIds })
    return response.data
  } catch (error) {
    console.error('Error bulk cancelling jobs:', error)
    throw new Error('Falha ao cancelar jobs em lote')
  }
}

export async function bulkDeleteJobs(jobIds: string[]): Promise<void> {
  try {
    await apiClient.delete(`${SCRAPING_JOBS_ENDPOINT}/bulk`, { data: { jobIds } })
  } catch (error) {
    console.error('Error bulk deleting jobs:', error)
    throw new Error('Falha ao deletar jobs em lote')
  }
}

// Import/Export
export async function importSearchTerms(file: File): Promise<BulkImportResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`${SEARCH_TERMS_ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error importing search terms:', error)
    throw new Error('Falha ao importar termos de busca')
  }
}

export async function exportSearchTerms(filters: SearchTermFilters = {}): Promise<Blob> {
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
    const url = queryString ? `${SEARCH_TERMS_ENDPOINT}/export?${queryString}` : `${SEARCH_TERMS_ENDPOINT}/export`

    const response = await apiClient.get(url, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting search terms:', error)
    throw new Error('Falha ao exportar termos de busca')
  }
}

export async function exportScrapingResults(jobId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(`${SCRAPING_JOBS_ENDPOINT}/${jobId}/export`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error) {
    console.error('Error exporting scraping results:', error)
    throw new Error('Falha ao exportar resultados do scraping')
  }
}

// Quick Actions
export async function runSearchTermNow(searchTermId: string): Promise<ScrapingJob> {
  try {
    const response = await apiClient.post(`${SEARCH_TERMS_ENDPOINT}/${searchTermId}/run-now`)
    return response.data
  } catch (error) {
    console.error('Error running search term now:', error)
    throw new Error('Falha ao executar termo de busca imediatamente')
  }
}

export async function scheduleSearchTerm(searchTermId: string, scheduleTime: string): Promise<ScrapingJob> {
  try {
    const response = await apiClient.post(`${SEARCH_TERMS_ENDPOINT}/${searchTermId}/schedule`, { scheduleTime })
    return response.data
  } catch (error) {
    console.error('Error scheduling search term:', error)
    throw new Error('Falha ao agendar termo de busca')
  }
}