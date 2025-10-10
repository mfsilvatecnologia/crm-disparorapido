import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LeadCard } from '@/features/campaign-stages/components/funnel-board/LeadCard'

describe('LeadCard (component)', () => {
  it('renders lead data and toggles selection', () => {
    const onToggle = vi.fn()
    const lead = { id: 'l1', nome: 'Lead 1', email: 'l1@example.com' } as any
    render(<LeadCard lead={lead} selected={false} onToggleSelect={onToggle} />)
    expect(screen.getByText('Lead 1')).toBeInTheDocument()
    expect(screen.getByText('l1@example.com')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Selecionar Lead 1'))
    expect(onToggle).toHaveBeenCalledWith('l1')
  })
})

