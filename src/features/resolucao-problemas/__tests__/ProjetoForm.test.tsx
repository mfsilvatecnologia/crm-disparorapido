import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ProjetoForm } from '../../../src/features/resolucao-problemas/components/projeto/ProjetoForm'

describe('ProjetoForm', () => {
  it('should block submit when required fields are missing', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<ProjetoForm onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /criar projeto/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      await screen.findByText(/titulo deve ter no minimo 3 caracteres/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/descricao deve ter no minimo 10 caracteres/i)
    ).toBeInTheDocument()
  })
})
