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
  const leadsByStage: Record<string, any[]> = {}
  
  // Find the initial stage to assign contacts without currentStageId
  const initialStage = stages.find(s => s.isInicial)
  const defaultStageId = initialStage?.id || stages[0]?.id || ''
  
  ;(contactsQuery.data || []).forEach((c: any) => {
    // If contact has no currentStageId, assign to initial stage
    const sid = c.currentStageId || defaultStageId
    if (!leadsByStage[sid]) leadsByStage[sid] = []
    
    // Create a more complete contact object with the data we have
    leadsByStage[sid].push({
      id: c.id,
      nome: c.nome || 'Contato sem nome',
      telefone: c.telefone || c.phone || null,
      email: c.email || null,
      empresa: c.empresa || c.company || null,
      addedAt: c.addedAt,
      stageChangedAt: c.stageChangedAt,
      contatoId: c.contatoId,
      leadId: c.leadId
    })
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
          onRequestTransition={async (leadId, toStageId, motivo) => {
            await transition.mutateAsync({ contactId: leadId, stageId: toStageId, motivo })
          }}
          onRequestBulkUpdate={async (leadIds, toStageId, motivo) => {
            await bulk.mutateAsync({ contactIds: leadIds, stageId: toStageId, motivo })
          }}
        />
      )}
    </div>
  )
}

export default CampaignFunnelPage

