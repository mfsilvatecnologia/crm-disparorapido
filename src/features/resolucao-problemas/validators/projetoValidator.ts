import { z } from 'zod';
import { ProjetoStatus } from '../types/projeto.types';

export const projetoCreateSchema = z.object({
  titulo: z
    .string()
    .min(3, 'Titulo deve ter no minimo 3 caracteres')
    .max(200, 'Titulo deve ter no maximo 200 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descricao deve ter no minimo 10 caracteres'),
  cliente_id: z
    .string()
    .uuid('ID do cliente invalido'),
  responsavel_id: z
    .string()
    .uuid('ID do responsavel invalido'),
  data_inicio: z
    .string()
    .datetime()
    .or(z.date()),
  data_prevista_conclusao: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),
  status: z
    .nativeEnum(ProjetoStatus)
    .optional()
    .default(ProjetoStatus.PLANEJAMENTO)
});

export const projetoUpdateSchema = z.object({
  titulo: z
    .string()
    .min(3)
    .max(200)
    .optional(),
  descricao: z
    .string()
    .min(10)
    .optional(),
  data_prevista_conclusao: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .optional(),
  status: z
    .nativeEnum(ProjetoStatus)
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Pelo menos um campo deve ser atualizado' }
);

export type ProjetoCreateInput = z.infer<typeof projetoCreateSchema>;
export type ProjetoUpdateInput = z.infer<typeof projetoUpdateSchema>;
