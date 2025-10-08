/**
 * Lead Validation Schemas
 * 
 * Zod schemas for lead marketplace and access validation
 */

import { z } from 'zod';
import { MarketplaceStatus, AccessType, InterestLevel } from '../types';

/**
 * Marketplace status schema
 */
export const marketplaceStatusSchema = z.nativeEnum(MarketplaceStatus);

/**
 * Access type schema
 */
export const accessTypeSchema = z.nativeEnum(AccessType);

/**
 * Interest level schema
 */
export const interestLevelSchema = z.nativeEnum(InterestLevel);

/**
 * Lead segmento schema
 */
export const leadSegmentoSchema = z.enum([
  'tecnologia',
  'varejo',
  'servicos',
  'industria',
  'saude',
  'educacao',
  'financeiro',
  'construcao',
  'alimentos',
  'outros'
]);

/**
 * Brazilian state (UF) schema
 */
export const ufSchema = z.string()
  .length(2, 'UF deve ter 2 caracteres')
  .regex(/^[A-Z]{2}$/, 'UF inválido');

/**
 * Phone schema (Brazilian format)
 */
export const phoneSchema = z.string()
  .regex(
    /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
    'Telefone deve estar no formato (11) 98765-4321'
  );

/**
 * Email schema
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .toLowerCase();

/**
 * Lead schema (masked)
 */
export const leadSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  empresaNome: z.string()
    .min(1, 'Nome da empresa é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  segmento: leadSegmentoSchema,
  
  cidade: z.string()
    .min(1, 'Cidade é obrigatória')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  
  estado: ufSchema,
  
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  
  email: z.string().min(1, 'Email é obrigatório'),
  
  custoCreditosCentavos: z.number()
    .int('Custo deve ser inteiro')
    .min(0, 'Custo não pode ser negativo')
    .max(1000000, 'Custo muito alto'),
  
  statusMarketplace: marketplaceStatusSchema,
  
  nivelInteresse: interestLevelSchema,
  
  tamanhoEmpresa: z.string()
    .max(50, 'Tamanho empresa deve ter no máximo 50 caracteres')
    .nullable(),
  
  website: z.string()
    .url('Website inválido')
    .nullable(),
  
  tags: z.array(z.string().min(1).max(50))
    .max(20, 'Máximo de 20 tags permitidas'),
  
  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .nullable(),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  
  updatedAt: z.string().datetime('Data de atualização inválida')
});

/**
 * Lead full schema (unmasked)
 */
export const leadFullSchema = leadSchema.extend({
  telefone: phoneSchema,
  
  email: emailSchema,
  
  contatoNome: z.string()
    .min(1, 'Nome do contato é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  contatoCargo: z.string()
    .max(100, 'Cargo deve ter no máximo 100 caracteres')
    .nullable(),
  
  linkedinUrl: z.string()
    .url('URL do LinkedIn inválida')
    .nullable(),
  
  observacoes: z.string()
    .max(2000, 'Observações devem ter no máximo 2000 caracteres')
    .nullable()
});

/**
 * Leads array schema
 */
export const leadsSchema = z.array(leadSchema);

/**
 * Lead access schema
 */
export const leadAccessSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  empresaId: z.string().uuid('ID da empresa deve ser um UUID válido'),
  
  leadId: z.string().uuid('ID do lead deve ser um UUID válido'),
  
  tipoAcesso: accessTypeSchema,
  
  visualizacoesCount: z.number()
    .int('Contagem de visualizações deve ser inteiro')
    .min(0, 'Não pode ser negativo'),
  
  limiteVisualizacoes: z.number()
    .int('Limite de visualizações deve ser inteiro')
    .min(1, 'Limite mínimo é 1')
    .nullable(),
  
  primeiroAcesso: z.string()
    .datetime('Data do primeiro acesso inválida')
    .nullable(),
  
  ultimoAcesso: z.string()
    .datetime('Data do último acesso inválida')
    .nullable(),
  
  concedidoEm: z.string().datetime('Data de concessão inválida'),
  
  expiraEm: z.string()
    .datetime('Data de expiração inválida')
    .nullable(),
  
  ativo: z.boolean(),
  
  transacaoCreditoId: z.string()
    .uuid('ID da transação deve ser um UUID válido')
    .nullable(),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  
  updatedAt: z.string().datetime('Data de atualização inválida')
}).refine(
  (data) => {
    // Se tem limite de visualizações, count não pode ser maior
    if (data.limiteVisualizacoes !== null) {
      return data.visualizacoesCount <= data.limiteVisualizacoes;
    }
    return true;
  },
  {
    message: 'Contagem de visualizações não pode exceder o limite',
    path: ['visualizacoesCount']
  }
).refine(
  (data) => {
    // Se tem expiraEm, deve ser no futuro (quando criado)
    if (data.expiraEm) {
      return new Date(data.expiraEm) > new Date(data.concedidoEm);
    }
    return true;
  },
  {
    message: 'Data de expiração deve ser posterior à data de concessão',
    path: ['expiraEm']
  }
).refine(
  (data) => {
    // Se tipoAcesso é COMPRADO, deve ter transacaoCreditoId
    if (data.tipoAcesso === AccessType.COMPRADO) {
      return data.transacaoCreditoId !== null;
    }
    return true;
  },
  {
    message: 'Acesso comprado deve ter ID da transação de crédito',
    path: ['transacaoCreditoId']
  }
);

/**
 * Lead search filters schema
 */
export const leadSearchFiltersSchema = z.object({
  query: z.string()
    .max(200, 'Busca deve ter no máximo 200 caracteres')
    .optional(),
  
  segmento: z.array(leadSegmentoSchema).optional(),
  
  estado: z.array(ufSchema).optional(),
  
  cidade: z.array(
    z.string().max(100, 'Cidade deve ter no máximo 100 caracteres')
  ).optional(),
  
  nivelInteresse: z.array(interestLevelSchema).optional(),
  
  custoMaximo: z.number()
    .int('Custo máximo deve ser inteiro')
    .min(0, 'Custo máximo não pode ser negativo')
    .optional(),
  
  tags: z.array(
    z.string().min(1).max(50)
  ).optional(),
  
  apenasDisponiveis: z.boolean().default(true),
  
  page: z.number().int().min(1).default(1),
  
  limit: z.number().int().min(1).max(100).default(20),
  
  orderBy: z.enum(['createdAt', 'custoCreditosCentavos', 'nivelInteresse'])
    .default('createdAt'),
  
  order: z.enum(['asc', 'desc']).default('desc')
});

/**
 * Grant trial access DTO schema
 */
export const grantTrialAccessSchema = z.object({
  leadId: z.string().uuid('ID do lead deve ser um UUID válido'),
  
  diasExpiracao: z.number()
    .int('Dias de expiração deve ser inteiro')
    .min(1, 'Mínimo de 1 dia')
    .max(30, 'Máximo de 30 dias')
    .default(7),
  
  limiteVisualizacoes: z.number()
    .int('Limite de visualizações deve ser inteiro')
    .min(1, 'Mínimo de 1 visualização')
    .max(100, 'Máximo de 100 visualizações')
    .default(3)
});

/**
 * Record lead view DTO schema
 */
export const recordLeadViewSchema = z.object({
  acessoId: z.string().uuid('ID do acesso deve ser um UUID válido')
});

/**
 * Helper to validate lead
 */
export function validateLead(data: unknown) {
  return leadSchema.safeParse(data);
}

/**
 * Helper to validate lead full
 */
export function validateLeadFull(data: unknown) {
  return leadFullSchema.safeParse(data);
}

/**
 * Helper to validate leads array
 */
export function validateLeads(data: unknown) {
  return leadsSchema.safeParse(data);
}

/**
 * Helper to validate lead access
 */
export function validateLeadAccess(data: unknown) {
  return leadAccessSchema.safeParse(data);
}

/**
 * Helper to validate lead search filters
 */
export function validateLeadSearchFilters(data: unknown) {
  return leadSearchFiltersSchema.safeParse(data);
}

/**
 * Helper to validate grant trial access
 */
export function validateGrantTrialAccess(data: unknown) {
  return grantTrialAccessSchema.safeParse(data);
}

/**
 * Type inference
 */
export type LeadSchema = z.infer<typeof leadSchema>;
export type LeadFullSchema = z.infer<typeof leadFullSchema>;
export type LeadAccessSchema = z.infer<typeof leadAccessSchema>;
export type LeadSearchFiltersSchema = z.infer<typeof leadSearchFiltersSchema>;
export type GrantTrialAccessSchema = z.infer<typeof grantTrialAccessSchema>;
export type RecordLeadViewSchema = z.infer<typeof recordLeadViewSchema>;
