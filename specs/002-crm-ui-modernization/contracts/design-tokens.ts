/**
 * Design Tokens Contract
 * 
 * Defines the design token structure for the CRM UI modernization.
 * These types are used to ensure consistency across the design system.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import type { LucideIcon } from 'lucide-react';

// =============================================================================
// COLOR TOKENS
// =============================================================================

/**
 * Semantic color scale (50-900)
 */
export interface ColorScale {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
  900: string;
}

/**
 * Status-specific color configuration
 */
export interface StatusColorConfig {
  bg: string;      // Background color class (e.g., 'bg-primary-100')
  text: string;    // Text color class (e.g., 'text-primary-700')
  border: string;  // Border color class (e.g., 'border-primary-500')
}

/**
 * Lead status values
 */
export type LeadStatus = 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado';

/**
 * Opportunity status values
 */
export type OpportunityStatus = 
  | 'prospeccao' 
  | 'qualificacao' 
  | 'proposta' 
  | 'negociacao' 
  | 'fechado_ganho' 
  | 'fechado_perdido';

/**
 * Campaign status values
 */
export type CampaignStatus = 'rascunho' | 'agendada' | 'ativa' | 'pausada' | 'concluida';

/**
 * Contract status values
 */
export type ContractStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado';

/**
 * Customer status values
 */
export type CustomerStatus = 'ativo' | 'inativo' | 'prospecto' | 'churned';

/**
 * Entity type for status mapping
 */
export type StatusEntityType = 'lead' | 'opportunity' | 'campaign' | 'contract' | 'customer';

/**
 * Type-safe status value based on entity type
 */
export type StatusValue<T extends StatusEntityType> = 
  T extends 'lead' ? LeadStatus :
  T extends 'opportunity' ? OpportunityStatus :
  T extends 'campaign' ? CampaignStatus :
  T extends 'contract' ? ContractStatus :
  T extends 'customer' ? CustomerStatus :
  never;

/**
 * Complete status colors configuration
 */
export interface StatusColors {
  lead: Record<LeadStatus, StatusColorConfig>;
  opportunity: Record<OpportunityStatus, StatusColorConfig>;
  campaign: Record<CampaignStatus, StatusColorConfig>;
  contract: Record<ContractStatus, StatusColorConfig>;
  customer: Record<CustomerStatus, StatusColorConfig>;
}

// =============================================================================
// SCORE TOKENS
// =============================================================================

/**
 * Score range identifiers
 */
export type ScoreRange = 'low' | 'medium' | 'high' | 'excellent';

/**
 * Score range configuration
 */
export interface ScoreRangeConfig {
  range: [number, number];
  color: 'danger' | 'warning' | 'info' | 'success';
  label: string;
}

/**
 * Score colors configuration
 */
export type ScoreColors = Record<ScoreRange, ScoreRangeConfig>;

// =============================================================================
// SPACING TOKENS
// =============================================================================

/**
 * Spacing scale keys (based on 4px)
 */
export type SpacingKey = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

/**
 * Spacing scale values
 */
export type SpacingScale = Record<SpacingKey, string>;

// =============================================================================
// STATUS CONFIGURATION
// =============================================================================

/**
 * Full status configuration including label and icon
 */
export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  colors: StatusColorConfig;
}

/**
 * Status configuration map for a specific entity type
 */
export type StatusConfigMap<T extends StatusEntityType> = Record<StatusValue<T>, StatusConfig>;

// =============================================================================
// EXPORTS / UTILITIES
// =============================================================================

/**
 * Get score range from numeric value
 */
export function getScoreRange(score: number): ScoreRange {
  if (score <= 50) return 'low';
  if (score <= 70) return 'medium';
  if (score <= 89) return 'high';
  return 'excellent';
}

/**
 * Type guard for valid status entity type
 */
export function isValidEntityType(type: string): type is StatusEntityType {
  return ['lead', 'opportunity', 'campaign', 'contract', 'customer'].includes(type);
}
