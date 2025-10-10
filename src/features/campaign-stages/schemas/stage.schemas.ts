import { z } from 'zod'

export const StageCategorySchema = z.enum([
  'novo',
  'contato',
  'qualificacao',
  'negociacao',
  'ganho',
  'perdido',
])

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, 'Color must be in format #RRGGBB')

export const CampaignLeadStageSchema = z.object({
  id: z.string().uuid(),
  empresaId: z.string().uuid(),
  nome: z.string().min(1).max(100),
  categoria: StageCategorySchema,
  cor: HexColorSchema,
  icone: z.string().optional(),
  ordem: z.number().int().min(0).max(19),
  isInicial: z.boolean(),
  isFinal: z.boolean(),
  cobraCreditos: z.boolean(),
  custocentavos: z.number().int().min(0).optional(),
  descricaoCobranca: z.string().max(255).optional(),
  isAtivo: z.boolean(),
  criadoPor: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateStageSchema = z
  .object({
    nome: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    categoria: StageCategorySchema,
    cor: HexColorSchema,
    icone: z.string().optional(),
    ordem: z.number().int().min(0).max(19).optional(),
    isInicial: z.boolean().default(false),
    isFinal: z.boolean().default(false),
    cobraCreditos: z.boolean().default(false),
    custocentavos: z.number().int().min(0).optional(),
    descricaoCobranca: z.string().max(255).optional(),
  })
  .refine(
    (data) => {
      if (data.cobraCreditos && !data.custocentavos) return false
      return true
    },
    {
      message: 'Custo em centavos é obrigatório quando cobrança está ativada',
      path: ['custocentavos'],
    }
  )

export const UpdateStageSchema = z
  .object({
    nome: z.string().min(1).max(100).optional(),
    cor: HexColorSchema.optional(),
    icone: z.string().optional(),
    cobraCreditos: z.boolean().optional(),
    custocentavos: z.number().int().min(0).optional(),
    descricaoCobranca: z.string().max(255).optional(),
  })
  .refine(
    (data) => {
      if (data.cobraCreditos && !data.custocentavos) return false
      return true
    },
    {
      message: 'Custo em centavos é obrigatório quando cobrança está ativada',
      path: ['custocentavos'],
    }
  )

export type CampaignLeadStage = z.infer<typeof CampaignLeadStageSchema>
export type CreateStageInput = z.infer<typeof CreateStageSchema>
export type UpdateStageInput = z.infer<typeof UpdateStageSchema>

