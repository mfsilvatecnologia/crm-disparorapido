// Types: Funnel Metrics

import type { StageCategory } from './stage.types'

export interface StageMetrics {
  stageId: string
  stageName: string
  categoria: StageCategory
  cor: string
  ordem: number
  leadCount: number
  percentageOfTotal: number
  conversionFromPrevious: number | null
  averageDurationHours: number | null
}

export interface FunnelMetrics {
  campaignId: string
  totalLeads: number
  stages: StageMetrics[]
  generatedAt: string
}

