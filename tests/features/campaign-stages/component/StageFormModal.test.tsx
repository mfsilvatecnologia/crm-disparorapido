import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StageFormModal } from '@/features/campaign-stages/components/stage-config/StageFormModal'

describe('StageFormModal', () => {
  it('submits valid form data', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(
      <StageFormModal open={true} onClose={onClose} onSubmit={onSubmit} />
    )

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Qualificação' } })
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'qualificacao' } })
    // Toggle cobrar créditos
    fireEvent.click(screen.getByLabelText('Cobrar créditos'))
    fireEvent.change(screen.getByLabelText('Custo (centavos)'), { target: { value: '500' } })

    fireEvent.click(screen.getByText('Salvar'))

    expect(onSubmit).toHaveBeenCalled()
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.nome).toBe('Qualificação')
    expect(arg.categoria).toBe('qualificacao')
    expect(arg.cobraCreditos).toBe(true)
    expect(arg.custoCentavos).toBe(500)
  })

  it('disables restricted fields in edit mode and shows warnings', async () => {
    const onSubmit = vi.fn()
    const onClose = vi.fn()
    render(
      <StageFormModal open={true} onClose={onClose} onSubmit={onSubmit} initial={{ id: 's1', nome: 'Novo', categoria: 'novo', cor: '#3B82F6', isInicial: true }} />
    )
    const categoria = screen.getByLabelText('Categoria') as HTMLSelectElement
    expect(categoria.disabled).toBe(true)
    expect(screen.getByText('Este campo não pode ser alterado após a criação.')).toBeInTheDocument()
    const inicial = screen.getByLabelText('Estágio inicial') as HTMLInputElement
    expect(inicial.disabled).toBe(true)
  })
})
