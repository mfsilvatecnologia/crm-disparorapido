/**
 * Contract Test: POST /api/v1/resolucao-problemas/projetos
 *
 * Validates the API contract for creating a project without methodology.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type {
  CreateProjetoRequest,
  ListProjetosQuery
} from '../../../src/features/resolucao-problemas/types/api.types'
import { Metodologia, ProjetoStatus } from '../../../src/features/resolucao-problemas/types/projeto.types'

const API_BASE_URL = 'http://localhost:3000/api/v1'
let receivedBody: CreateProjetoRequest | null = null
let receivedQuery: Partial<ListProjetosQuery> | null = null

const mockProjeto = {
  id: '9a32d45a-0c7f-4c3f-9f55-7b1f6fd9e001',
  titulo: 'Investigar defeitos na linha de producao',
  descricao: 'Analise de defeitos recorrentes identificados no setor de montagem',
  cliente_id: '7e6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c1d',
  responsavel_id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
  data_inicio: '2025-12-18',
  data_prevista_conclusao: null,
  status: 'PLANEJAMENTO',
  metodologia: null,
  pode_definir_metodologia: true,
  progresso_percentual: 0,
  metodologia_definida_em: null,
  metodologia_definida_por_id: null,
  arquivado_em: null,
  created_at: '2025-12-18T00:00:00.000Z',
  updated_at: '2025-12-18T00:00:00.000Z',
  cliente: {
    id: '7e6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c1d',
    nome: 'Cliente XYZ',
    razao_social: null,
    cnpj: null,
    email: 'cliente@example.com',
    telefone: null,
    ativo: true
  },
  responsavel: {
    id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
    nome: 'Joao Silva',
    email: 'joao.silva@example.com',
    avatar_url: null,
    cargo: null,
    departamento: null,
    ativo: true
  },
  participantes: [],
  etapas: []
}

const listResponse = {
  items: [mockProjeto],
  total: 1,
  page: 1,
  limit: 20,
  total_pages: 1
}

const server = setupServer(
  http.post(`${API_BASE_URL}/resolucao-problemas/projetos`, async ({ request }) => {
    receivedBody = (await request.json()) as CreateProjetoRequest
    return HttpResponse.json(mockProjeto, { status: 201 })
  }),
  http.get(`${API_BASE_URL}/resolucao-problemas/projetos`, ({ request }) => {
    const url = new URL(request.url)
    receivedQuery = {
      page: url.searchParams.get('page')
        ? Number(url.searchParams.get('page'))
        : undefined,
      limit: url.searchParams.get('limit')
        ? Number(url.searchParams.get('limit'))
        : undefined,
      status: url.searchParams.getAll('status'),
      metodologia: url.searchParams.getAll('metodologia'),
      busca: url.searchParams.get('busca') || undefined
    }
    return HttpResponse.json(listResponse, { status: 200 })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('Contract: POST /resolucao-problemas/projetos', () => {
  it('should create project and return required fields', async () => {
    process.env.VITE_API_BASE_URL = API_BASE_URL

    const { projetoService } = await import(
      '../../../src/features/resolucao-problemas/services/projetoService'
    )

    const payload: CreateProjetoRequest = {
      titulo: 'Investigar defeitos na linha de producao',
      descricao: 'Analise de defeitos recorrentes identificados no setor de montagem',
      cliente_id: '7e6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c1d',
      responsavel_id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
      data_inicio: '2025-12-18',
      data_prevista_conclusao: null,
      status: 'PLANEJAMENTO'
    }

    const result = await projetoService.criar(payload)

    expect(receivedBody).toMatchObject(payload)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('titulo', payload.titulo)
    expect(result).toHaveProperty('descricao', payload.descricao)
    expect(result).toHaveProperty('cliente_id', payload.cliente_id)
    expect(result).toHaveProperty('responsavel_id', payload.responsavel_id)
    expect(result).toHaveProperty('data_inicio', payload.data_inicio)
    expect(result).toHaveProperty('status', payload.status)
    expect(result).toHaveProperty('metodologia', null)
    expect(result).toHaveProperty('pode_definir_metodologia', true)
    expect(result).toHaveProperty('progresso_percentual', 0)
    expect(Array.isArray(result.etapas)).toBe(true)
  })
})

describe('Contract: GET /resolucao-problemas/projetos', () => {
  it('should list projects with filters and pagination', async () => {
    process.env.VITE_API_BASE_URL = API_BASE_URL

    const { projetoService } = await import(
      '../../../src/features/resolucao-problemas/services/projetoService'
    )

    const result = await projetoService.listar({
      page: 2,
      limit: 10,
      status: [ProjetoStatus.PLANEJAMENTO, ProjetoStatus.EM_ANDAMENTO],
      metodologia: Metodologia.MASP,
      busca: 'defeitos'
    })

    expect(receivedQuery).toMatchObject({
      page: 2,
      limit: 10,
      busca: 'defeitos'
    })
    expect((receivedQuery?.status || []).length).toBe(2)
    expect(receivedQuery?.metodologia).toContain(Metodologia.MASP)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.total).toBe(1)
  })
})
