import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProjetoCard } from '../../../src/features/resolucao-problemas/components/projeto/ProjetoCard'
import { ProjetoStatus } from '../../../src/features/resolucao-problemas/types/projeto.types'

const projeto = {
  id: 'proj-1',
  titulo: 'Projeto teste',
  descricao: 'Descricao do projeto teste',
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
}

describe('ProjetoCard', () => {
  it('should render project summary', () => {
    render(<ProjetoCard projeto={projeto} />)

    expect(screen.getByText('Projeto teste')).toBeInTheDocument()
    expect(screen.getByText('Planejamento')).toBeInTheDocument()
    expect(screen.getByText(/lead/i)).toBeInTheDocument()
  })
})
