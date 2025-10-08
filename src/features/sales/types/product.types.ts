/**
 * Product Types
 * 
 * TypeScript interfaces for subscription products/plans
 */

/**
 * Billing cycle options for subscriptions
 */
export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

/**
 * Product/Plan interface
 * Represents a subscription tier offered to customers
 */
export interface Product {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Product name (e.g., "Básico", "Pro", "Enterprise") */
  name: string;
  
  /** Product description (optional) */
  description?: string;
  
  /** Product category */
  categoria?: 'crm_saas' | 'extensao_chrome' | 'marketplace_leads';
  
  /** Monthly price in centavos (e.g., 9900 = R$ 99,00) */
  priceMonthly: number;
  
  /** Billing cycle */
  billingCycle: BillingCycle;
  
  /** List of features included in this plan */
  features: string[];
  
  /** Maximum concurrent sessions allowed */
  maxSessions: number;
  
  /** Maximum leads (null = unlimited) */
  maxLeads: number | null;
  
  /** Trial duration in days (0 = no trial) */
  trialDays: number;
  
  /** Whether the plan is available for purchase */
  isActive: boolean;
  
  /** Whether to show "Most Popular" badge */
  isMostPopular: boolean;
  
  /** Display order (lower = first) */
  position: number;
  
  /** Asaas product ID for payment gateway sync (optional) */
  asaasProductId?: string;
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Last update timestamp */
  updatedAt: string;
  
  /** Soft delete timestamp (null = not deleted) */
  deletedAt: string | null;
}

/**
 * Create Product DTO
 * Data required to create a new product
 */
export interface CreateProductDTO {
  name: string;
  description?: string;
  priceMonthly: number;
  billingCycle: BillingCycle;
  features: string[];
  maxSessions: number;
  maxLeads: number | null;
  trialDays: number;
  isActive?: boolean;
  isMostPopular?: boolean;
  position?: number;
}

/**
 * Update Product DTO
 * Data that can be updated in a product
 */
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  priceMonthly?: number;
  billingCycle?: BillingCycle;
  features?: string[];
  maxSessions?: number;
  maxLeads?: number | null;
  trialDays?: number;
  isActive?: boolean;
  isMostPopular?: boolean;
  position?: number;
}

/**
 * Product with computed fields
 * Extended product interface with helper fields
 */
export interface ProductWithComputed extends Product {
  /** Formatted price (e.g., "R$ 99,00") */
  formattedPrice: string;
  
  /** Billing cycle label (e.g., "Mensal", "Trimestral") */
  billingCycleLabel: string;
  
  /** Whether product has trial */
  hasTrial: boolean;
  
  /** Trial duration label (e.g., "7 dias grátis") */
  trialLabel: string;
}

/**
 * Helper type for billing cycle labels
 */
export const BillingCycleLabels: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: 'Mensal',
  [BillingCycle.QUARTERLY]: 'Trimestral',
  [BillingCycle.YEARLY]: 'Anual'
};

/**
 * Helper function to format price from centavos to BRL
 */
export function formatPrice(centavos: number): string {
  const reais = centavos / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(reais);
}

/**
 * Helper function to get billing cycle label
 */
export function getBillingCycleLabel(cycle: BillingCycle): string {
  return BillingCycleLabels[cycle];
}

/**
 * Helper function to get trial label
 */
export function getTrialLabel(trialDays: number): string {
  if (trialDays === 0) return 'Sem período de teste';
  if (trialDays === 1) return '1 dia grátis';
  return `${trialDays} dias grátis`;
}
