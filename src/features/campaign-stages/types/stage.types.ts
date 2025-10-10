// Types: Campaign Lead Stages

export type StageCategory =
  | 'novo'
  | 'contato'
  | 'qualificacao'
  | 'negociacao'
  | 'ganho'
  | 'perdido'

export interface CampaignLeadStage {
  id: string
  empresaId: string
  nome: string
  categoria: StageCategory
  cor: string
  icone?: string
  ordem: number
  isInicial: boolean
  isFinal: boolean
  cobraCreditos: boolean
  custocentavos?: number
  descricaoCobranca?: string
  isAtivo: boolean
  criadoPor?: string
  createdAt: string
  updatedAt: string
}

export interface CreateStageRequest {
  nome: string
  categoria: StageCategory
  cor: string
  icone?: string
  ordem?: number
  isInicial?: boolean
  isFinal?: boolean
  cobraCreditos?: boolean
  custocentavos?: number
  descricaoCobranca?: string
}

export interface UpdateStageRequest {
  nome?: string
  cor?: string
  icone?: string
  cobraCreditos?: boolean
  custocentavos?: number
  descricaoCobranca?: string
}

export interface ReorderStagesRequest {
  stages: Array<{
    id: string
    ordem: number
  }>
}

