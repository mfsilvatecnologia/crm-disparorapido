import { z } from 'zod';

export const contractStatusSchema = z.enum(['VIGENTE', 'VENCIDO', 'RENOVADO', 'CANCELADO']);

const contractBaseSchema = z.object({
  numero: z.string().min(1, 'Número do contrato é obrigatório').max(100),
  valor: z.coerce.number().positive('Valor deve ser positivo'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
  servicos: z.string().min(1, 'Descrição dos serviços é obrigatória'),
  moeda: z.string().length(3).optional().default('BRL'),
  condicoes: z.string().nullable().optional(),
  status: contractStatusSchema.optional().default('VIGENTE'),
});

export const createContractSchema = contractBaseSchema.refine(
  (data) => new Date(data.dataFim) > new Date(data.dataInicio),
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  }
);

export const updateContractSchema = contractBaseSchema.partial();

export const renewContractSchema = z
  .object({
    numero: z.string().min(1, 'Número do novo contrato é obrigatório').max(100),
    dataInicio: z.string().min(1, 'Data de início é obrigatória'),
    dataFim: z.string().min(1, 'Data de fim é obrigatória'),
    valor: z.coerce.number().positive('Valor deve ser positivo'),
    servicos: z.string().min(1, 'Descrição dos serviços é obrigatória'),
    condicoes: z.string().nullable().optional(),
  })
  .refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['dataFim'],
  });

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type RenewContractInput = z.infer<typeof renewContractSchema>;
