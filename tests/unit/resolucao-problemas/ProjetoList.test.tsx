import { describe, it, expect } from 'vitest'
import { filterProjetos } from '../../../src/features/resolucao-problemas/components/projeto/ProjetoList'
import { ProjetoStatus } from '../../../src/features/resolucao-problemas/types/projeto.types'

const projetos = [
  {
    id: 'proj-1',
    titulo: 'Projeto MASP',
    descricao: 'Descricao sobre defeitos',
    cliente_id: 'cliente-1',
    responsavel_id: 'resp-1',
    data_inicio: '2025-12-18',
    data_prevista_conclusao: null,
    status: ProjetoStatus.PLANEJAMENTO,
    created_at: '2025-12-18T00:00:00.000Z',
    updated_at: '2025-12-18T00:00:00.000Z',
    arquivado_em: null,
    metodologia: null,
    pode_definir_metodologia: true,
    etapas: [],
    progresso_percentual: 0
  },
  {
    id: 'proj-2',
    titulo: 'Projeto A3',
    descricao: 'Outro tipo de analise',
    cliente_id: 'cliente-2',
    responsavel_id: 'resp-2',
    data_inicio: '2025-12-18',
    data_prevista_conclusao: null,
    status: ProjetoStatus.EM_ANDAMENTO,
    created_at: '2025-12-18T00:00:00.000Z',
    updated_at: '2025-12-18T00:00:00.000Z',
    arquivado_em: null,
    metodologia: null,
    pode_definir_metodologia: true,
    etapas: [],
    progresso_percentual: 0
  }
]

describe('filterProjetos', () => {
  it('should filter by search term', () => {
    const result = filterProjetos(projetos, 'defeitos')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('proj-1')
  })
})
