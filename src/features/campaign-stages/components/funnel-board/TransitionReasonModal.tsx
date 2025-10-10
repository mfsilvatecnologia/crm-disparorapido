import React from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (motivo?: string) => void
}

export function TransitionReasonModal({ open, onClose, onConfirm }: Props) {
  const [motivo, setMotivo] = React.useState('')
  React.useEffect(() => { if (!open) setMotivo('') }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded p-4 shadow w-[480px]">
        <div className="font-medium mb-2">Motivo da transição (opcional)</div>
        <textarea className="border rounded w-full h-24 p-2 text-sm" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        <div className="flex justify-end gap-2 mt-3">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Cancelar</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onConfirm(motivo || undefined)}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

export default TransitionReasonModal

