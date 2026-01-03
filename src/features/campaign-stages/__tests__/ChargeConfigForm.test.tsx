import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChargeConfigForm } from '@/features/campaign-stages/components/billing/ChargeConfigForm'

vi.mock('@/features/campaign-stages/hooks/useCharges', () => ({
  useBillingConfiguration: vi.fn(() => ({ data: { modeloCobrancaCampanha: 'mudanca_estagio', debitarMudancaEstagio: true }, isLoading: false })),
  useUpdateBillingConfiguration: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

describe('ChargeConfigForm', () => {
  it('renders and toggles checkbox', () => {
    render(<ChargeConfigForm />)
    const checkbox = screen.getByLabelText('Debitar créditos ao mover para estágio com cobrança') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })
})

