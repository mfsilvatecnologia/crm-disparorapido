import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StageMetricCard } from '@/features/campaign-stages/components/metrics/StageMetricCard'

describe('StageMetricCard', () => {
  it('renders KPI values', () => {
    const metric: any = { stageId: 's1', stageName: 'Novo', categoria: 'novo', cor: '#000', ordem: 0, leadCount: 60, percentageOfTotal: 60, conversionFromPrevious: null, averageDurationHours: 12 }
    render(<StageMetricCard metric={metric} />)
    expect(screen.getByText('Novo')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText(/60% do total/)).toBeInTheDocument()
  })
})

