import React from 'react'
import type { CampaignLeadStage } from '../../types/stage.types'

type Props = {
  open: boolean
  stages: CampaignLeadStage[]
  onClose: () => void
  onConfirm: (stageId: string, motivo?: string) => void
}

export function BulkUpdateModal({ open, stages, onClose, onConfirm }: Props) {
  const [stageId, setStageId] = React.useState('')
  const [motivo, setMotivo] = React.useState('')
  React.useEffect(() => {
    if (!open) { setStageId(''); setMotivo('') }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded p-4 shadow w-[480px]">
        <div className="font-medium mb-3">Atualização em massa</div>
        <label className="grid gap-1 text-sm mb-2">
          <span>Estágio de destino</span>
          <select className="border rounded px-2 py-1" value={stageId} onChange={(e) => setStageId(e.target.value)}>
            <option value="" disabled>Selecione...</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span>Motivo (opcional)</span>
          <textarea className="border rounded w-full h-20 p-2 text-sm" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </label>
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Cancelar</button>
          <button disabled={!stageId} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" onClick={() => onConfirm(stageId, motivo || undefined)}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export default BulkUpdateModal

