import React from 'react'
import type { LeadCardData } from '../../types/ui.types'

type Props = {
  lead: LeadCardData
  selected?: boolean
  onToggleSelect?: (id: string) => void
}

export function LeadCard({ lead, selected, onToggleSelect }: Props) {
  return (
    <div className={`rounded border p-2 bg-white dark:bg-neutral-900 ${selected ? 'ring-2 ring-blue-500' : ''}`}
      data-testid={`lead-${lead.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-sm">{lead.nome || lead.id}</div>
        <input aria-label={`Selecionar ${lead.nome || lead.id}`} type="checkbox" checked={!!selected} onChange={() => onToggleSelect?.(lead.id)} />
      </div>
      {lead.email && <div className="text-xs text-muted-foreground">{lead.email}</div>}
    </div>
  )
}

export default LeadCard

