import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChargesSummaryCard } from '@/features/campaign-stages/components/billing/ChargesSummaryCard'

vi.mock('@/features/campaign-stages/hooks/useCharges', () => ({
  useCampaignChargesSummary: vi.fn(() => ({ data: {
    campanhaId: 'c1', totalCharges: 3, successfulCharges: 2, failedCharges: 1, totalAmountCentavos: 1000, totalAmountReais: 10, chargesByStage: [
      { stageId: 's1', stageName: 'Qualificação', chargeCount: 2, totalCentavos: 1000, totalReais: 10 }
    ], generatedAt: new Date().toISOString()
  }, isLoading: false })),
}))

describe('ChargesSummaryCard', () => {
  it('shows summary numbers', () => {
    render(<ChargesSummaryCard campaignId="c1" />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

