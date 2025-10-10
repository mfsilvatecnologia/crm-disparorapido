import React from 'react'
import { useLeadStageHistory } from '../../hooks/useStageHistory'
import TimelineItem from './TimelineItem'

type Props = {
  campaignId: string
  contactId: string
}

export function LeadStageHistory({ campaignId, contactId }: Props) {
  const { data, isLoading, isError } = useLeadStageHistory(campaignId, contactId)

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Carregando histórico...</div>
  if (isError) return <div className="p-4 text-sm text-red-600">Falha ao carregar histórico</div>
  const history = data || []
  if (history.length === 0) return <div className="p-4 text-sm text-muted-foreground">Nenhuma transição registrada.</div>

  return (
    <div className="relative pl-3">
      <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
      <div className="grid gap-2">
        {history.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default LeadStageHistory

