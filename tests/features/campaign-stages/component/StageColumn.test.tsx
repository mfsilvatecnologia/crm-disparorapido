import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StageColumn } from '@/features/campaign-stages/components/funnel-board/StageColumn'

describe('StageColumn (component)', () => {
  it('renders stage header and lead count, toggles selection', () => {
    const onToggle = vi.fn()
    const stage = { id: 's1', nome: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' } as any
    const leads = [
      { id: 'l1', nome: 'Lead 1' },
      { id: 'l2', nome: 'Lead 2' },
    ] as any
    render(<StageColumn stage={stage} leads={leads} selectedIds={new Set()} onToggleSelect={onToggle} />)
    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Selecionar Lead 1'))
    expect(onToggle).toHaveBeenCalledWith('l1')
  })
})

