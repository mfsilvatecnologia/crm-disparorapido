/**
 * Design Tokens
 * 
 * Centralized design token definitions for LeadsRapido CRM.
 * These tokens are used by the design system components and
 * mirror the values in tailwind.config.ts.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import {
  Circle,
  CheckCircle2,
  Phone,
  ArrowRightCircle,
  XCircle,
  Search,
  Target,
  FileText,
  Handshake,
  XOctagon,
  FileEdit,
  Calendar,
  Play,
  Pause,
  CheckSquare,
  Building2,
  UserX,
  Lock,
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// STATUS TYPES
// =============================================================================

/** Lead status values */
export type LeadStatus = 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado' | 'privado';

/** Opportunity status values */
export type OpportunityStatus = 
  | 'prospeccao' 
  | 'qualificacao' 
  | 'proposta' 
  | 'negociacao' 
  | 'fechado_ganho' 
  | 'fechado_perdido';

/** Campaign status values */
export type CampaignStatus = 'rascunho' | 'agendada' | 'ativa' | 'pausada' | 'concluida';

/** Contract status values */
export type ContractStatus = 'ativo' | 'inativo' | 'suspenso' | 'cancelado';

/** Customer status values */
export type CustomerStatus = 'ativo' | 'inativo' | 'prospecto' | 'churned';

/** Score range identifiers */
export type ScoreRange = 'low' | 'medium' | 'high' | 'excellent';

// =============================================================================
// STATUS COLOR CONFIG
// =============================================================================

export interface StatusColorConfig {
  bg: string;
  text: string;
  border: string;
}

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  colors: StatusColorConfig;
}

// =============================================================================
// LEAD STATUS CONFIG
// =============================================================================

/**
 * Configuration for lead status badges.
 * Maps status values to labels, icons, and color classes.
 */
export const leadStatusConfig: Record<LeadStatus, StatusConfig> = {
  novo: {
    label: 'Novo',
    icon: Circle,
    colors: {
      bg: 'bg-primary-100',
      text: 'text-primary-700',
      border: 'border-primary-500',
    },
  },
  qualificado: {
    label: 'Qualificado',
    icon: CheckCircle2,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  contatado: {
    label: 'Contatado',
    icon: Phone,
    colors: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-500',
    },
  },
  convertido: {
    label: 'Convertido',
    icon: ArrowRightCircle,
    colors: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-500',
    },
  },
  descartado: {
    label: 'Descartado',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-500',
    },
  },
  privado: {
    label: 'Privado',
    icon: Lock,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-500',
    },
  },
} as const;

// =============================================================================
// OPPORTUNITY STATUS CONFIG
// =============================================================================

/**
 * Configuration for opportunity status badges.
 */
export const opportunityStatusConfig: Record<OpportunityStatus, StatusConfig> = {
  prospeccao: {
    label: 'Prospecção',
    icon: Search,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-500',
    },
  },
  qualificacao: {
    label: 'Qualificação',
    icon: Target,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-500',
    },
  },
  proposta: {
    label: 'Proposta',
    icon: FileText,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-500',
    },
  },
  negociacao: {
    label: 'Negociação',
    icon: Handshake,
    colors: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-500',
    },
  },
  fechado_ganho: {
    label: 'Fechado (Ganho)',
    icon: CheckCircle2,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  fechado_perdido: {
    label: 'Fechado (Perdido)',
    icon: XOctagon,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-500',
    },
  },
} as const;

// =============================================================================
// CAMPAIGN STATUS CONFIG
// =============================================================================

/**
 * Configuration for campaign status badges.
 */
export const campaignStatusConfig: Record<CampaignStatus, StatusConfig> = {
  rascunho: {
    label: 'Rascunho',
    icon: FileEdit,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-400',
    },
  },
  agendada: {
    label: 'Agendada',
    icon: Calendar,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-500',
    },
  },
  ativa: {
    label: 'Ativa',
    icon: Play,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  pausada: {
    label: 'Pausada',
    icon: Pause,
    colors: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-500',
    },
  },
  concluida: {
    label: 'Concluída',
    icon: CheckSquare,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-400',
    },
  },
} as const;

// =============================================================================
// CONTRACT STATUS CONFIG
// =============================================================================

/**
 * Configuration for contract status badges.
 */
export const contractStatusConfig: Record<ContractStatus, StatusConfig> = {
  ativo: {
    label: 'Ativo',
    icon: CheckCircle2,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  inativo: {
    label: 'Inativo',
    icon: Circle,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-400',
    },
  },
  suspenso: {
    label: 'Suspenso',
    icon: Pause,
    colors: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-500',
    },
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-500',
    },
  },
} as const;

// =============================================================================
// CUSTOMER STATUS CONFIG
// =============================================================================

/**
 * Configuration for customer status badges.
 */
export const customerStatusConfig: Record<CustomerStatus, StatusConfig> = {
  ativo: {
    label: 'Ativo',
    icon: Building2,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-500',
    },
  },
  inativo: {
    label: 'Inativo',
    icon: Circle,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-400',
    },
  },
  prospecto: {
    label: 'Prospecto',
    icon: Target,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-500',
    },
  },
  churned: {
    label: 'Churned',
    icon: UserX,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-500',
    },
  },
} as const;

// =============================================================================
// SCORE CONFIG
// =============================================================================

export interface ScoreRangeConfig {
  min: number;
  max: number;
  color: string;
  bg: string;
  label: string;
}

/**
 * Configuration for score badges based on numeric ranges.
 * 
 * Score ranges:
 * - 0-50: Low (red)
 * - 51-70: Medium (amber/yellow)
 * - 71-89: High (blue)
 * - 90-100: Excellent (green)
 */
export const scoreConfig: Record<ScoreRange, ScoreRangeConfig> = {
  low: {
    min: 0,
    max: 50,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: 'Baixo',
  },
  medium: {
    min: 51,
    max: 70,
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    label: 'Médio',
  },
  high: {
    min: 71,
    max: 89,
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    label: 'Alto',
  },
  excellent: {
    min: 90,
    max: 100,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: 'Excelente',
  },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the score range identifier for a numeric score.
 * 
 * @param score - Numeric score value (0-100)
 * @returns The score range identifier
 * 
 * @example
 * getScoreRange(45) // 'low'
 * getScoreRange(65) // 'medium'
 * getScoreRange(85) // 'high'
 * getScoreRange(95) // 'excellent'
 */
export function getScoreRange(score: number): ScoreRange {
  if (score <= 50) return 'low';
  if (score <= 70) return 'medium';
  if (score <= 89) return 'high';
  return 'excellent';
}

/**
 * Get the full score configuration for a numeric score.
 * 
 * @param score - Numeric score value (0-100)
 * @returns The score range configuration with colors and label
 * 
 * @example
 * getScoreConfig(85)
 * // { min: 71, max: 89, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Alto' }
 */
export function getScoreConfig(score: number): ScoreRangeConfig {
  const range = getScoreRange(score);
  return scoreConfig[range];
}

/**
 * Type guard to check if a string is a valid lead status.
 * 
 * @param status - String to check
 * @returns True if the string is a valid LeadStatus
 */
export function isValidLeadStatus(status: string): status is LeadStatus {
  return status in leadStatusConfig;
}

/**
 * Type guard to check if a string is a valid opportunity status.
 * 
 * @param status - String to check
 * @returns True if the string is a valid OpportunityStatus
 */
export function isValidOpportunityStatus(status: string): status is OpportunityStatus {
  return status in opportunityStatusConfig;
}

/**
 * Type guard to check if a string is a valid campaign status.
 * 
 * @param status - String to check
 * @returns True if the string is a valid CampaignStatus
 */
export function isValidCampaignStatus(status: string): status is CampaignStatus {
  return status in campaignStatusConfig;
}

/**
 * Type guard to check if a string is a valid contract status.
 * 
 * @param status - String to check
 * @returns True if the string is a valid ContractStatus
 */
export function isValidContractStatus(status: string): status is ContractStatus {
  return status in contractStatusConfig;
}

/**
 * Type guard to check if a string is a valid customer status.
 * 
 * @param status - String to check
 * @returns True if the string is a valid CustomerStatus
 */
export function isValidCustomerStatus(status: string): status is CustomerStatus {
  return status in customerStatusConfig;
}

// =============================================================================
// ENTITY TYPE MAPPING
// =============================================================================

export type EntityType = 'lead' | 'opportunity' | 'campaign' | 'contract' | 'customer';

/**
 * Get status configuration based on entity type and status value.
 */
export function getStatusConfig(entityType: EntityType, status: string): StatusConfig | undefined {
  switch (entityType) {
    case 'lead':
      return isValidLeadStatus(status) ? leadStatusConfig[status] : undefined;
    case 'opportunity':
      return isValidOpportunityStatus(status) ? opportunityStatusConfig[status] : undefined;
    case 'campaign':
      return isValidCampaignStatus(status) ? campaignStatusConfig[status] : undefined;
    case 'contract':
      return isValidContractStatus(status) ? contractStatusConfig[status] : undefined;
    case 'customer':
      return isValidCustomerStatus(status) ? customerStatusConfig[status] : undefined;
    default:
      return undefined;
  }
}
