import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChargeConfigForm } from '@/features/campaign-stages/components/billing/ChargeConfigForm'

vi.mock('@/features/campaign-stages/hooks/useCharges', () => ({
  useBillingConfiguration: vi.fn(() => ({ data: { modeloCobrancaCampanha: 'mudanca_estagio', debitarMudancaEstagio: false }, isLoading: false })),
  useUpdateBillingConfiguration: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}))

const { useUpdateBillingConfiguration } = await import('@/features/campaign-stages/hooks/useCharges') as any

describe('[Integration] Billing Config', () => {
  it('toggles debitarMudancaEstagio and saves', () => {
    render(<ChargeConfigForm />)
    const checkbox = screen.getByLabelText('Debitar créditos ao mover para estágio com cobrança') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    const hook = useUpdateBillingConfiguration()
    const spy = hook.mutate as any
    fireEvent.click(screen.getByText('Salvar'))
    expect(spy).toHaveBeenCalled()
  })
})

