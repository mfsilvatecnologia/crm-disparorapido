import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeadStageHistory } from '@/features/campaign-stages/components/history/LeadStageHistory'

vi.mock('@/features/campaign-stages/hooks/useStageHistory', () => ({
  useLeadStageHistory: vi.fn(),
}))

const { useLeadStageHistory } = await import('@/features/campaign-stages/hooks/useStageHistory') as any

describe('LeadStageHistory', () => {
  it('renders empty state', () => {
    useLeadStageHistory.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(<LeadStageHistory campaignId="camp" contactId="c1" />)
    expect(screen.getByText('Nenhuma transição registrada.')).toBeInTheDocument()
  })

  it('renders items list', () => {
    useLeadStageHistory.mockReturnValue({
      data: [
        { id: 'h1', campaignContactId: 'c1', fromStageId: null, toStageId: 's1', toStageName: 'S1', automatico: true, createdAt: new Date().toISOString() },
        { id: 'h2', campaignContactId: 'c1', fromStageId: 's1', toStageId: 's2', fromStageName: 'S1', toStageName: 'S2', automatico: false, userName: 'Bob', duracaoHoras: 2, createdAt: new Date().toISOString() },
      ],
      isLoading: false,
      isError: false,
    })
    render(<LeadStageHistory campaignId="camp" contactId="c1" />)
    expect(screen.getByText('S1')).toBeInTheDocument()
    expect(screen.getByText('S2')).toBeInTheDocument()
  })
})

