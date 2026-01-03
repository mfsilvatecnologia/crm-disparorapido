import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { MetodologiaSelector } from '../../../src/features/resolucao-problemas/components/metodologia/MetodologiaSelector'
import { Metodologia } from '../../../src/features/resolucao-problemas/types/projeto.types'

describe('MetodologiaSelector', () => {
  it('should notify when selection changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(
      <MetodologiaSelector value={Metodologia.MASP} onChange={onChange} />
    )

    await user.click(screen.getByLabelText(/8d/i))

    expect(onChange).toHaveBeenCalledWith(Metodologia.OITO_D)
  })
})
