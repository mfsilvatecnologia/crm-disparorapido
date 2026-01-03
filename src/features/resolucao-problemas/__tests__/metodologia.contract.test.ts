/**
 * Contract Test: POST /api/v1/resolucao-problemas/projetos/:id/metodologia
 *
 * Validates the API contract for defining a methodology on a project.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { DefinirMetodologiaRequest } from '../../../src/features/resolucao-problemas/types/api.types'
import { Metodologia } from '../../../src/features/resolucao-problemas/types/projeto.types'

const API_BASE_URL = 'http://localhost:3000/api/v1'
let receivedBody: DefinirMetodologiaRequest | null = null

const projetoId = '9a32d45a-0c7f-4c3f-9f55-7b1f6fd9e001'

const mockProjeto = {
  id: projetoId,
  titulo: 'Investigar defeitos na linha de producao',
  descricao: 'Analise de defeitos recorrentes identificados no setor de montagem',
  cliente_id: '7e6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c1d',
  responsavel_id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
  data_inicio: '2025-12-18',
  data_prevista_conclusao: null,
  status: 'PLANEJAMENTO',
  metodologia: 'MASP',
  pode_definir_metodologia: false,
  progresso_percentual: 0,
  metodologia_definida_em: '2025-12-18T00:00:00.000Z',
  metodologia_definida_por_id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
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
  etapas: [
    {
      id: 'step-1',
      projeto_id: projetoId,
      tipo: 'MASP',
      ordem: 1,
      titulo: 'Identificacao',
      descricao: 'Identificar o problema',
      status: 'PENDENTE',
      data_inicio: null,
      data_conclusao: null,
      responsavel_id: null,
      responsavel: null,
      observacoes: null,
      created_at: '2025-12-18T00:00:00.000Z',
      updated_at: '2025-12-18T00:00:00.000Z'
    }
  ]
}

const server = setupServer(
  http.post(
    `${API_BASE_URL}/resolucao-problemas/projetos/:id/metodologia`,
    async ({ request }) => {
      receivedBody = (await request.json()) as DefinirMetodologiaRequest
      return HttpResponse.json(mockProjeto, { status: 200 })
    }
  )
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('Contract: POST /resolucao-problemas/projetos/:id/metodologia', () => {
  it('should define methodology and return updated project', async () => {
    process.env.VITE_API_BASE_URL = API_BASE_URL

    const { projetoService } = await import(
      '../../../src/features/resolucao-problemas/services/projetoService'
    )

    const payload: DefinirMetodologiaRequest = {
      metodologia: Metodologia.MASP
    }

    const result = await projetoService.definirMetodologia(projetoId, payload)

    expect(receivedBody).toMatchObject(payload)
    expect(result).toHaveProperty('id', projetoId)
    expect(result).toHaveProperty('metodologia', 'MASP')
    expect(result).toHaveProperty('pode_definir_metodologia', false)
    expect(Array.isArray(result.etapas)).toBe(true)
    expect(result.etapas.length).toBeGreaterThan(0)
  })
})
