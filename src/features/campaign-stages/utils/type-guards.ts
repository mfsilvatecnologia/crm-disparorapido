import type { CampaignLeadStage } from '../types/stage.types'
import type { TransitionLeadResponse } from '../types/history.types'

export function isInitialStage(stage: CampaignLeadStage): boolean {
  return stage.isInicial === true
}

export function isFinalStage(stage: CampaignLeadStage): boolean {
  return stage.isFinal === true
}

export function stageChargesCredits(stage: CampaignLeadStage): boolean {
  return stage.cobraCreditos === true && (stage.custocentavos ?? 0) > 0
}

export function isApiError(response: any): response is { success: false; error: any } {
  return response?.success === false
}

export function hasTransitionWarnings(response: TransitionLeadResponse): boolean {
  return Array.isArray(response.warnings) && response.warnings.length > 0
}

