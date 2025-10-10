import React from 'react'
import { useCampaignChargesSummary } from '../../hooks/useCharges'

type Props = { campaignId: string }

export function ChargesSummaryCard({ campaignId }: Props) {
  const { data, isLoading } = useCampaignChargesSummary(campaignId)
  if (isLoading) return <div className="border rounded p-3">Carregando resumo...</div>
  if (!data) return <div className="border rounded p-3 text-red-600">Falha ao carregar resumo</div>

  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Resumo de Cobranças</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-lg font-semibold">{data.totalCharges}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Sucesso</div>
          <div className="text-lg font-semibold text-green-600">{data.successfulCharges}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Falhas</div>
          <div className="text-lg font-semibold text-red-600">{data.failedCharges}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Total (R$)</div>
          <div className="text-lg font-semibold">{data.totalAmountReais.toFixed(2)}</div>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-1">Por Estágio</div>
        <div className="grid gap-1">
          {data.chargesByStage.map((s) => (
            <div key={s.stageId} className="flex items-center justify-between text-sm">
              <span>{s.stageName}</span>
              <span>{s.chargeCount} — R$ {s.totalReais.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ChargesSummaryCard

