import { describe, it, expect } from 'vitest'
import { definirMetodologiaSchema } from '../../../src/features/resolucao-problemas/validators/metodologiaValidator'
import { Metodologia } from '../../../src/features/resolucao-problemas/types/projeto.types'

describe('definirMetodologiaSchema', () => {
  it('should accept valid methodology', () => {
    expect(() =>
      definirMetodologiaSchema.parse({ metodologia: Metodologia.A3 })
    ).not.toThrow()
  })

  it('should reject invalid methodology', () => {
    expect(() =>
      definirMetodologiaSchema.parse({ metodologia: 'INVALIDA' })
    ).toThrow()
  })
})
