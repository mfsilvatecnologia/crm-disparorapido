// Constants for Campaign Stages feature

import type { StageCategory } from './stage.types'

export const STAGE_LIMITS = {
  MAX_STAGES_PER_COMPANY: 20,
  MIN_STAGE_NAME_LENGTH: 1,
  MAX_STAGE_NAME_LENGTH: 100,
  MAX_MOTIVO_LENGTH: 500,
  MAX_DESCRICAO_COBRANCA_LENGTH: 255,
} as const

export const DEFAULT_STAGE_COLORS: Record<StageCategory, string> = {
  novo: '#3B82F6',
  contato: '#2563EB',
  qualificacao: '#10B981',
  negociacao: '#F59E0B',
  ganho: '#10B981',
  perdido: '#EF4444',
} as const

export const DEFAULT_STAGE_ICONS: Record<StageCategory, string> = {
  novo: 'inbox',
  contato: 'phone',
  qualificacao: 'star',
  negociacao: 'trending-up',
  ganho: 'check-circle',
  perdido: 'x-circle',
} as const

export const STAGE_CATEGORY_LABELS: Record<StageCategory, string> = {
  novo: 'Novo Lead',
  contato: 'Contato Inicial',
  qualificacao: 'Qualificação',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
} as const

// Query keys and cache timings for React Query
export const QUERY_KEYS = {
  stages: (filters?: any) => ['campaign-stages', filters] as const,
  stage: (id: string) => ['campaign-stage', id] as const,
  transitions: (campaignId: string, contactId: string) =>
    ['lead-stage-history', campaignId, contactId] as const,
  funnel: (campaignId: string) => ['campaign-funnel', campaignId] as const,
  charges: (campaignId: string, filters?: any) =>
    ['campaign-charges', campaignId, filters] as const,
  chargesSummary: (campaignId: string) => ['campaign-charges-summary', campaignId] as const,
  billingConfig: () => ['billing-config'] as const,
}

export const CACHE_TIMES = {
  short: 1000 * 10, // 10s
  medium: 1000 * 60, // 1m
  long: 1000 * 60 * 5, // 5m
} as const

