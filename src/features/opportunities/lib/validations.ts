import { z } from 'zod';

export const opportunityStageSchema = z.enum([
  'Lead',
  'Qualificado',
  'Proposta',
  'Negociacao',
  'Ganha',
  'Perdida',
]);

export const createOpportunitySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().nullable().optional(),
  valorEstimado: z.coerce
    .number({ required_error: 'Valor estimado é obrigatório' })
    .positive('Valor deve ser positivo'),
  probabilidade: z.coerce
    .number()
    .int()
    .min(0, 'Probabilidade mínima é 0%')
    .max(100, 'Probabilidade máxima é 100%'),
  estagio: opportunityStageSchema,
  expectedCloseDate: z.string().min(1, 'Data prevista é obrigatória'),
  leadId: z.string().uuid().nullable().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const loseOpportunitySchema = z.object({
  motivoPerdida: z.string().min(3, 'Motivo deve ter no mínimo 3 caracteres'),
});

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;
export type UpdateOpportunityInput = z.infer<typeof updateOpportunitySchema>;
export type LoseOpportunityInput = z.infer<typeof loseOpportunitySchema>;
