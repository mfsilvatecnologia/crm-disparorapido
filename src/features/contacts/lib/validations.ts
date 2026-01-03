import { z } from 'zod';

export const createContactSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(255),
  email: z.string().email('Email invalido'),
  telefone: z.string().nullable().optional(),
  cargo: z.string().nullable().optional(),
  departamento: z.string().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
