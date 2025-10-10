import React from 'react'
import { useParams } from 'react-router-dom'
import { useCampaignStages } from '../hooks/useStages'
import { useCampaignContacts } from '@/features/campaigns/hooks/useCampaigns'
import { useTransitionLead, useBulkUpdateLeads } from '../hooks/useTransitions'
import FunnelBoard from '../components/funnel-board/FunnelBoard'

export function CampaignFunnelPage() {
  const { id: campaignId } = useParams<{ id: string }>()
  const stagesQuery = useCampaignStages()
  const contactsQuery = useCampaignContacts(campaignId || '')
  const transition = useTransitionLead(campaignId || '')
  const bulk = useBulkUpdateLeads(campaignId || '')

  const stages = stagesQuery.data || []
  // NOTE: Backend should provide currentStageId; if not, leads will not appear in columns
  const leadsByStage: Record<string, any[]> = {}
  ;(contactsQuery.data || []).forEach((c: any) => {
    const sid = c.currentStageId || ''
    if (!leadsByStage[sid]) leadsByStage[sid] = []
    leadsByStage[sid].push({ id: c.id, nome: c.id } as any)
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Funil da Campanha</h1>
      </div>

      {(stagesQuery.isLoading || contactsQuery.isLoading) && <div>Carregando funil...</div>}
      {(stagesQuery.isError || contactsQuery.isError) && <div>Falha ao carregar dados</div>}

      {!stagesQuery.isLoading && !stagesQuery.isError && (
        <FunnelBoard
          stages={stages}
          leadsByStage={leadsByStage}
          onRequestTransition={(leadId, toStageId, motivo) => transition.mutateAsync({ contactId: leadId, stageId: toStageId, motivo })}
          onRequestBulkUpdate={(leadIds, toStageId, motivo) => bulk.mutateAsync({ contactIds: leadIds, stageId: toStageId, motivo })}
        />
      )}
    </div>
  )
}

export default CampaignFunnelPage

