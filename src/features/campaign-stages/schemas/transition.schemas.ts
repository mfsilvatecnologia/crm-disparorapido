import { z } from 'zod'

export const TransitionLeadSchema = z.object({
  stageId: z.string().uuid('ID do estágio inválido'),
  motivo: z.string().max(500, 'Motivo deve ter no máximo 500 caracteres').optional(),
  automatico: z.boolean().default(false),
})

export const CampaignContactStageHistorySchema = z.object({
  id: z.string().uuid(),
  campaignContactId: z.string().uuid(),
  fromStageId: z.string().uuid().nullable(),
  toStageId: z.string().uuid(),
  motivo: z.string().optional(),
  automatico: z.boolean(),
  duracaoHoras: z.number().optional(),
  criadoPor: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  fromStageName: z.string().optional(),
  toStageName: z.string(),
  userName: z.string().optional(),
})

export type TransitionLeadInput = z.infer<typeof TransitionLeadSchema>

