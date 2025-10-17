import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChargeAuditTable } from '@/features/campaign-stages/components/billing/ChargeAuditTable'

vi.mock('@/features/campaign-stages/hooks/useCharges', () => ({
  useCampaignCharges: vi.fn(() => ({ data: [
    { id: 'ch1', campaignContactId: 'l1', stageId: 's1', stageName: 'Qualificação', custoCentavos: 500, foiCobrado: true, createdAt: new Date().toISOString() }
  ], isLoading: false })),
}))

describe('ChargeAuditTable', () => {
  it('renders table rows', () => {
    render(<ChargeAuditTable campaignId="c1" stages={[{ id: 's1', nome: 'Qualificação', categoria: 'qualificacao', cor: '#000', ordem: 0, isInicial: false, isFinal: false, cobraCreditos: true, isAtivo: true, empresaId: 'e', createdAt: '', updatedAt: '' } as any]} />)
    expect(screen.getByText('Qualificação')).toBeInTheDocument()
    expect(screen.getByText('Sucesso')).toBeInTheDocument()
  })
})

