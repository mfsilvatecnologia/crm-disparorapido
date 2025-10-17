// Types: Billing & Charges

export type ChargeType =
  | 'mudanca_estagio'
  | 'acesso_lead'
  | 'execucao_agente'

export interface CampaignStageCharge {
  id: string
  empresaId: string
  campanhaId: string
  campaignContactId: string
  stageId: string
  custoCentavos: number
  tipoCobranca: ChargeType
  creditoTransacaoId?: string
  motivo?: string
  foiCobrado: boolean
  erroCobranca?: string
  createdAt: string
  stageName?: string
}

export interface ChargeFilters {
  startDate?: string
  endDate?: string
  stageId?: string
  foiCobrado?: boolean
}

export interface ChargesSummary {
  campanhaId: string
  totalCharges: number
  successfulCharges: number
  failedCharges: number
  totalAmountCentavos: number
  totalAmountReais: number
  chargesByStage: Array<{
    stageId: string
    stageName: string
    chargeCount: number
    totalCentavos: number
    totalReais: number
  }>
  generatedAt: string
}

export type BillingModel = 'mudanca_estagio' | 'acesso_lead' | 'execucao_agente'

export interface BillingConfiguration {
  empresaId: string
  modeloCobrancaCampanha: BillingModel
  debitarMudancaEstagio: boolean
  updatedAt: string
}

export interface UpdateBillingConfigRequest {
  modeloCobrancaCampanha: BillingModel
  debitarMudancaEstagio: boolean
}

