import type {
  CreateProjetoRequest,
  DefinirMetodologiaRequest,
  ListProjetosQuery,
  PaginatedResponse
} from '../types/api.types'
import type { Projeto } from '../types/projeto.types'
import { apiClient } from './apiClient'

const API_BASE_URL = '/api/v1';
const BASE_PATH = `${API_BASE_URL}/resolucao-problemas/projetos`

async function criar(payload: CreateProjetoRequest): Promise<Projeto> {
  const response = await apiClient.post<Projeto>(BASE_PATH, payload)
  return response.data
}

async function definirMetodologia(
  projetoId: string,
  payload: DefinirMetodologiaRequest
): Promise<Projeto> {
  const response = await apiClient.post<Projeto>(
    `${BASE_PATH}/${projetoId}/metodologia`,
    payload
  )
  return response.data
}

const appendQueryValue = (
  params: URLSearchParams,
  key: string,
  value: string | string[] | boolean | number | undefined
) => {
  if (value === undefined) return
  if (Array.isArray(value)) {
    value.forEach((item) => params.append(key, item))
    return
  }
  params.append(key, String(value))
}

async function listar(query: ListProjetosQuery = {}): Promise<PaginatedResponse<Projeto>> {
  const params = new URLSearchParams()

  appendQueryValue(params, 'page', query.page)
  appendQueryValue(params, 'limit', query.limit)
  appendQueryValue(params, 'status', query.status as string | string[] | undefined)
  appendQueryValue(params, 'metodologia', query.metodologia as string | string[] | undefined)
  appendQueryValue(params, 'cliente_id', query.cliente_id)
  appendQueryValue(params, 'responsavel_id', query.responsavel_id)
  appendQueryValue(params, 'busca', query.busca)
  appendQueryValue(params, 'data_inicio_de', query.data_inicio_de)
  appendQueryValue(params, 'data_inicio_ate', query.data_inicio_ate)
  appendQueryValue(params, 'incluir_arquivados', query.incluir_arquivados)
  appendQueryValue(params, 'ordenar_por', query.ordenar_por)
  appendQueryValue(params, 'ordem', query.ordem)

  const queryString = params.toString()
  const endpoint = queryString ? `${BASE_PATH}?${queryString}` : BASE_PATH

  const response = await apiClient.get<PaginatedResponse<Projeto>>(endpoint)
  return response.data
}

async function buscarPorId(projetoId: string): Promise<Projeto> {
  const response = await apiClient.get<Projeto>(`${BASE_PATH}/${projetoId}`)
  return response.data
}

export const projetoService = {
  criar,
  definirMetodologia,
  listar,
  buscarPorId
}
