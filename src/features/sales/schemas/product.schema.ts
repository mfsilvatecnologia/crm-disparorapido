/**
 * Product Validation Schemas
 * 
 * Zod schemas for product/plan validation
 */

import { z } from 'zod';
import { BillingCycle } from '../types/product.types';

/**
 * Billing cycle schema
 */
export const billingCycleSchema = z.nativeEnum(BillingCycle);

/**
 * Product schema
 */
export const productSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  
  precoMensalCentavos: z.number()
    .int('Preço deve ser um número inteiro')
    .min(0, 'Preço não pode ser negativo')
    .max(1000000, 'Preço muito alto'),
  
  billingCycle: billingCycleSchema,
  
  features: z.array(z.string().min(1))
    .min(1, 'Produto deve ter pelo menos 1 feature')
    .max(20, 'Máximo de 20 features permitidas'),
  
  maxSessoes: z.number()
    .int('Máximo de sessões deve ser inteiro')
    .min(1, 'Mínimo de 1 sessão')
    .max(100000, 'Máximo de 100.000 sessões')
    .nullable(),
  
  maxLeads: z.number()
    .int('Máximo de leads deve ser inteiro')
    .min(0, 'Não pode ser negativo')
    .max(1000000, 'Máximo de 1.000.000 leads')
    .nullable(),
  
  trialDias: z.number()
    .int('Dias de trial deve ser inteiro')
    .min(0, 'Não pode ser negativo')
    .max(365, 'Máximo de 365 dias'),
  
  ativo: z.boolean(),
  
  maisPopular: z.boolean(),
  
  ordem: z.number()
    .int('Ordem deve ser inteiro')
    .min(0, 'Ordem não pode ser negativa'),
  
  createdAt: z.string().datetime('Data de criação inválida'),
  
  updatedAt: z.string().datetime('Data de atualização inválida')
});

/**
 * Product array schema
 */
export const productsSchema = z.array(productSchema);

/**
 * Product ID schema
 */
export const productIdSchema = z.string()
  .uuid('ID do produto deve ser um UUID válido');

/**
 * Create Product DTO schema
 */
export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

/**
 * Update Product DTO schema
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Helper to validate product
 */
export function validateProduct(data: unknown) {
  return productSchema.safeParse(data);
}

/**
 * Helper to validate product array
 */
export function validateProducts(data: unknown) {
  return productsSchema.safeParse(data);
}

/**
 * Helper to validate product ID
 */
export function validateProductId(data: unknown) {
  return productIdSchema.safeParse(data);
}

/**
 * Type inference
 */
export type ProductSchema = z.infer<typeof productSchema>;
export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
