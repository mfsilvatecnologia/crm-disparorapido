import React from 'react'

type Props = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  errorMessage?: string
  activeLeadsCount?: number
}

export function StageDeleteDialog({ open, onConfirm, onCancel, errorMessage, activeLeadsCount }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded p-4 shadow w-[360px]">
        <div className="font-medium mb-2">Excluir estágio</div>
        <p className="text-sm mb-2">Tem certeza? Estágios com leads ativos não podem ser excluídos.</p>
        {typeof activeLeadsCount === 'number' && activeLeadsCount > 0 && (
          <p className="text-xs text-red-600 mb-2">Leads ativos: {activeLeadsCount}</p>
        )}
        {errorMessage && (
          <p className="text-xs text-red-600 mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onCancel}>Cancelar</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  )
}

export default StageDeleteDialog
