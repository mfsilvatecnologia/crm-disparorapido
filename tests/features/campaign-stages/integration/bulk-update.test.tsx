import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FunnelBoard } from '@/features/campaign-stages/components/funnel-board/FunnelBoard'

describe('[Integration] Bulk update (mocked)', () => {
  it('opens modal and calls onRequestBulkUpdate', async () => {
    const onBulk = vi.fn()
    const stages = [
      { id: 's1', nome: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' },
      { id: 's2', nome: 'Qualificação', categoria: 'qualificacao', cor: '#000', ordem: 1, isInicial: false, isFinal: false, cobraCreditos: false, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' },
    ] as any
    const leadsByStage = { s1: [{ id: 'l1', nome: 'Lead 1' }, { id: 'l2', nome: 'Lead 2' }] }
    render(<FunnelBoard stages={stages} leadsByStage={leadsByStage} onRequestTransition={vi.fn()} onRequestBulkUpdate={onBulk} />)

    // select 2 leads
    fireEvent.click(screen.getByLabelText('Selecionar Lead 1'))
    fireEvent.click(screen.getByLabelText('Selecionar Lead 2'))
    fireEvent.click(screen.getByText('Atualização em massa (2)'))
    // choose stage and confirm
    fireEvent.change(screen.getByDisplayValue('Selecione...'), { target: { value: 's2' } })
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onBulk).toHaveBeenCalled()
  })
})

