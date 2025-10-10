import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { FunnelChart } from '@/features/campaign-stages/components/metrics/FunnelChart'

describe('FunnelChart', () => {
  it('renders without crashing', () => {
    const data: any = [
      { stageId: 's1', stageName: 'Novo', cor: '#000', ordem: 0, leadCount: 10, percentageOfTotal: 50, categoria: 'novo' },
      { stageId: 's2', stageName: 'Qualificação', cor: '#000', ordem: 1, leadCount: 10, percentageOfTotal: 50, categoria: 'qualificacao' },
    ]
    render(<FunnelChart data={data} />)
  })
})

