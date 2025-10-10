import React from 'react'
import type { CampaignContactStageHistory } from '../../types/history.types'
import { TimelineMarker } from './TimelineMarker'
import { formatDurationHours } from '../../utils/formatters'

type Props = { item: CampaignContactStageHistory }

export function TimelineItem({ item }: Props) {
  return (
    <div className="grid grid-cols-[auto,1fr] gap-3 items-start">
      <TimelineMarker automatico={item.automatico} />
      <div className="pb-4">
        <div className="text-sm">
          <span className="font-medium">{item.fromStageName || 'Início'}</span>
          <span className="mx-1">→</span>
          <span className="font-medium">{item.toStageName}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {item.userName ? (
            <span>Por: {item.userName}</span>
          ) : (
            <span>Automático</span>
          )}
          {item.duracaoHoras !== undefined && (
            <span className="ml-2">Permanência anterior: {formatDurationHours(item.duracaoHoras)}</span>
          )}
        </div>
        {item.motivo && <div className="text-xs mt-1">Motivo: {item.motivo}</div>}
        <div className="text-[11px] text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</div>
      </div>
    </div>
  )
}

export default TimelineItem

