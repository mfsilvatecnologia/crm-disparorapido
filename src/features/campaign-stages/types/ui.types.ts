// UI-specific types for Campaign Stages feature

import type { StageCategory, CampaignLeadStage } from './stage.types'

export interface StageCardData {
  id: string
  nome: string
  categoria: StageCategory
  cor: string
  icone?: string
  ordem: number
  cobraCreditos?: boolean
  custoCentavos?: number
  isInicial?: boolean
  isFinal?: boolean
}

export interface LeadCardData {
  id: string
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  currentStageId?: string
  createdAt?: string
  addedAt?: string
  stageChangedAt?: string
  contatoId?: string
  leadId?: string
}

export interface KanbanColumn {
  stage: CampaignLeadStage
  leadIds: string[]
}

export interface StageFormState {
  id?: string
  nome: string
  categoria: StageCategory
  cor: string
  icone?: string
  isInicial?: boolean
  isFinal?: boolean
  cobraCreditos?: boolean
  custoCentavos?: number
  descricaoCobranca?: string
}

export interface BulkActionState {
  selectedLeadIds: string[]
  targetStageId?: string
  motivo?: string
}

