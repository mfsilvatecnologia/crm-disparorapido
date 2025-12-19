import { describe, it, expect } from 'vitest'
import { projetoCreateSchema } from '../../../src/features/resolucao-problemas/validators/projetoValidator'

const basePayload = {
  titulo: 'Projeto teste',
  descricao: 'Descricao valida para o projeto de teste',
  cliente_id: '7e6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c1d',
  responsavel_id: '8f6d9b6f-4a56-4b7d-8c5e-7f6e4b3a2c2e',
  data_inicio: new Date('2025-12-18')
}

describe('projetoCreateSchema', () => {
  it('should accept valid payload', () => {
    expect(() => projetoCreateSchema.parse(basePayload)).not.toThrow()
  })

  it('should reject invalid title', () => {
    expect(() =>
      projetoCreateSchema.parse({
        ...basePayload,
        titulo: 'A'
      })
    ).toThrow()
  })
})
