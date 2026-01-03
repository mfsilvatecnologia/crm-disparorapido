import { z } from 'zod';

export const activityTypeSchema = z.enum(['call', 'meeting', 'email', 'note']);

export const createActivitySchema = z.object({
  tipo: activityTypeSchema,
  descricao: z.string().min(1, 'Descricao e obrigatoria'),
  dataHora: z.string().min(1, 'Data e hora sao obrigatorias'),
});

export const updateActivitySchema = createActivitySchema.partial();

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
