import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StageCard } from '@/features/campaign-stages/components/stage-config/StageCard'

describe('StageCard', () => {
  it('renders info and triggers actions', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    const stage = {
      id: '1', nome: 'Novo', categoria: 'novo', cor: '#3B82F6', ordem: 0,
      isInicial: true, isFinal: false, cobraCreditos: true, custoCentavos: 500
    } as any
    render(<StageCard stage={stage} onEdit={onEdit} onDelete={onDelete} />)
    expect(screen.getByText('Novo')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Editar'))
    fireEvent.click(screen.getByText('Excluir'))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})

