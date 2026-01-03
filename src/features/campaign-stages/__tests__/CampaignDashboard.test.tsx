import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { CampaignDashboard } from '@/features/campaign-stages/components/metrics/CampaignDashboard'

vi.mock('@/features/campaign-stages/hooks/useFunnelMetrics', () => ({
  useCampaignFunnelMetrics: vi.fn(),
}))

const { useCampaignFunnelMetrics } = await import('@/features/campaign-stages/hooks/useFunnelMetrics') as any

describe('CampaignDashboard', () => {
  it('renders metrics', () => {
    useCampaignFunnelMetrics.mockReturnValue({
      data: {
        campaignId: 'c1', totalLeads: 20, generatedAt: new Date().toISOString(), stages: [
          { stageId: 's1', stageName: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, leadCount: 10, percentageOfTotal: 50, conversionFromPrevious: null, averageDurationHours: 12 },
          { stageId: 's2', stageName: 'Qualificação', categoria: 'qualificacao', cor: '#000', ordem: 1, leadCount: 10, percentageOfTotal: 50, conversionFromPrevious: 50, averageDurationHours: 24 },
        ]
      },
      isLoading: false,
      isError: false,
    })
    render(
      <MemoryRouter initialEntries={["/campaigns/c1/metrics"]}>
        <Routes>
          <Route path="/campaigns/:id/metrics" element={<CampaignDashboard />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Métricas do Funil')).toBeInTheDocument()
    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('Qualificação')).toBeInTheDocument()
  })
})

