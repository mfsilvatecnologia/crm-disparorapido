import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FunnelBoard } from '@/features/campaign-stages/components/funnel-board/FunnelBoard'

describe('[Integration] Lead transition via board (mocked)', () => {
  it('prompts reason and calls onRequestTransition', async () => {
    const onReq = vi.fn()
    const stages = [
      { id: 's1', nome: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, isInicial: true, isFinal: false, cobraCreditos: false, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' },
      { id: 's2', nome: 'Qualificação', categoria: 'qualificacao', cor: '#000', ordem: 1, isInicial: false, isFinal: false, cobraCreditos: false, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' },
    ] as any
    const leadsByStage = { s1: [{ id: 'l1', nome: 'Lead 1' }] }
    render(<FunnelBoard testMode stages={stages} leadsByStage={leadsByStage} onRequestTransition={onReq} onRequestBulkUpdate={vi.fn()} />)
    const btn = screen.getByLabelText('__test-move__')
    fireEvent.click(btn)
    // modal opens
    fireEvent.click(screen.getByText('Confirmar'))
    expect(onReq).toHaveBeenCalledWith('l1', 's2', undefined)
  })
})

