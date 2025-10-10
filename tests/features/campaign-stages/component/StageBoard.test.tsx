import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StageBoard } from '@/features/campaign-stages/components/stage-config/StageBoard'

describe('StageBoard', () => {
  it('calls onReorder when using arrow buttons', () => {
    const onReorder = vi.fn()
    const stages = [
      { id: '1', nome: 'A', categoria: 'novo', cor: '#000', ordem: 0 },
      { id: '2', nome: 'B', categoria: 'contato', cor: '#000', ordem: 1 },
    ] as any
    render(<StageBoard stages={stages} onReorder={onReorder} />)
    const upButtons = screen.getAllByText('↑')
    const downButtons = screen.getAllByText('↓')
    // Move second item up
    fireEvent.click(upButtons[1])
    expect(onReorder).toHaveBeenCalled()
    const order = onReorder.mock.calls[0][0]
    expect(order[0].id).toBe('2')
    expect(order[0].ordem).toBe(0)
  })
})

