import React from 'react'
import type { CampaignLeadStage } from '../../types/stage.types'
import type { LeadCardData } from '../../types/ui.types'
import LeadCard from './LeadCard'

type Props = {
  stage: CampaignLeadStage
  leads: LeadCardData[]
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

export function StageColumn({ stage, leads, selectedIds, onToggleSelect }: Props) {
  return (
    <div className="min-w-64 w-64 bg-muted/30 rounded p-2" data-testid={`column-${stage.id}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium" style={{ color: stage.cor }}>{stage.nome}</div>
        <div className="text-xs">{leads.length}</div>
      </div>
      <div className="grid gap-2">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} selected={selectedIds?.has(lead.id)} onToggleSelect={onToggleSelect} />
        ))}
      </div>
    </div>
  )
}

export default StageColumn

