import React from 'react'
import type { CampaignLeadStage } from '../../types/stage.types'
import type { LeadCardData } from '../../types/ui.types'
import StageColumn from './StageColumn'
import TransitionReasonModal from './TransitionReasonModal'
import BulkUpdateModal from './BulkUpdateModal'

type Props = {
  stages: CampaignLeadStage[]
  leadsByStage: Record<string, LeadCardData[]>
  onRequestTransition: (leadId: string, toStageId: string, motivo?: string) => Promise<void> | void
  onRequestBulkUpdate: (leadIds: string[], toStageId: string, motivo?: string) => Promise<void> | void
  testMode?: boolean
}

export function FunnelBoard({ stages, leadsByStage, onRequestTransition, onRequestBulkUpdate, testMode }: Props) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [reasonModal, setReasonModal] = React.useState<{ open: boolean; leadId?: string; toStageId?: string }>({ open: false })
  const [bulkOpen, setBulkOpen] = React.useState(false)

  const onToggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  async function confirmTransition(motivo?: string) {
    const { leadId, toStageId } = reasonModal
    if (leadId && toStageId) {
      await onRequestTransition(leadId, toStageId, motivo)
    }
    setReasonModal({ open: false })
  }

  // For tests, render a simple move button
  const firstStage = stages[0]?.id
  const secondStage = stages[1]?.id

  return (
    <div className="flex gap-3 overflow-auto" data-testid="funnel-board">
      {testMode && firstStage && secondStage && leadsByStage[firstStage]?.[0] && (
        <button
          onClick={() => setReasonModal({ open: true, leadId: leadsByStage[firstStage][0].id, toStageId: secondStage })}
          className="hidden"
          aria-label="__test-move__"
        >__test-move__</button>
      )}

      {stages.map((s) => (
        <StageColumn
          key={s.id}
          stage={s}
          leads={leadsByStage[s.id] || []}
          selectedIds={selected}
          onToggleSelect={onToggleSelect}
        />
      ))}

      {/* <div className="self-start">
        <button className="px-3 py-2 border rounded" onClick={() => setBulkOpen(true)} disabled={selected.size === 0}>
          Atualização em massa ({selected.size})
        </button>
      </div> */}

      <TransitionReasonModal
        open={reasonModal.open}
        onClose={() => setReasonModal({ open: false })}
        onConfirm={confirmTransition}
      />

      <BulkUpdateModal
        open={bulkOpen}
        stages={stages}
        onClose={() => setBulkOpen(false)}
        onConfirm={async (stageId, motivo) => {
          await onRequestBulkUpdate(Array.from(selected), stageId, motivo)
          setBulkOpen(false)
          setSelected(new Set())
        }}
      />
    </div>
  )
}

export default FunnelBoard

