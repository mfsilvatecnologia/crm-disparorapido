import React from 'react'
import { useCampaignStages } from '../hooks/useStages'
import ChargeConfigForm from '../components/billing/ChargeConfigForm'
import ChargeAuditTable from '../components/billing/ChargeAuditTable'
import ChargesSummaryCard from '../components/billing/ChargesSummaryCard'

export function BillingConfigPage() {
  const stagesQuery = useCampaignStages()
  const [campaignId, setCampaignId] = React.useState('')

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cobrança por Estágios</h1>
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
      </div>

      <ChargeConfigForm />
      {campaignId && <ChargesSummaryCard campaignId={campaignId} />}
      {campaignId && (
        <ChargeAuditTable campaignId={campaignId} stages={stagesQuery.data || []} />
      )}
    </div>
  )
}

export default BillingConfigPage

