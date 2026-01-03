import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineItem } from '@/features/campaign-stages/components/history/TimelineItem'

describe('TimelineItem', () => {
  it('renders manual transition with user and motivo', () => {
    const item: any = {
      id: 'h1', campaignContactId: 'c1', fromStageId: 's1', toStageId: 's2', fromStageName: 'S1', toStageName: 'S2', motivo: 'Teste', automatico: false, userName: 'Alice', duracaoHoras: 1.5, createdAt: new Date().toISOString()
    }
    render(<TimelineItem item={item} />)
    expect(screen.getByText('S1')).toBeInTheDocument()
    expect(screen.getByText('S2')).toBeInTheDocument()
    expect(screen.getByText(/Por: Alice/)).toBeInTheDocument()
    expect(screen.getByText(/Motivo: Teste/)).toBeInTheDocument()
  })
})

