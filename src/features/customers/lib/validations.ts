import { z } from 'zod';

export const customerStatusSchema = z.enum(['ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO']);
export const customerSegmentSchema = z.enum(['Enterprise', 'SMB', 'Startup', 'Outro']);

export const updateCustomerSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  segmento: customerSegmentSchema.nullable().optional(),
  endereco: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  email: z.string().email('Email invalido').nullable().optional(),
  notas: z.string().nullable().optional(),
});

export const updateCustomerStatusSchema = z.object({
  status: customerStatusSchema,
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>;
