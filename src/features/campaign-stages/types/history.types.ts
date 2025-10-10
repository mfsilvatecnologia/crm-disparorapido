// Types: Lead Stage History and Transitions

export interface CampaignContactStageHistory {
  id: string
  campaignContactId: string
  fromStageId: string | null
  toStageId: string
  motivo?: string
  automatico: boolean
  duracaoHoras?: number
  criadoPor?: string
  createdAt: string
  fromStageName?: string
  toStageName: string
  userName?: string
}

export interface TransitionLeadRequest {
  stageId: string
  motivo?: string
  automatico: boolean
}

export interface TransitionLeadResponse {
  success: boolean
  data: {
    contactId: string
    previousStageId: string | null
    currentStageId: string
    stageChangedAt: string
    stageChangedBy: string | null
    duracaoHoras: number | null
  }
  warnings?: Array<{
    type: 'charge_failed' | 'validation_warning'
    message: string
  }>
}

export interface BulkStageUpdateRequest {
  contactIds: string[]
  stageId: string
  motivo?: string
  automatico: boolean
}

export interface BulkStageUpdateResponse {
  success: boolean
  data: {
    successCount: number
    failedCount: number
    totalRequested: number
    errors: Array<{
      contactId: string
      error: string
    }>
    chargeWarnings: Array<{
      contactId: string
      warning: string
    }>
  }
}

