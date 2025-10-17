import React from 'react'
import type { StageCardData } from '../../types/ui.types'
import { formatCentavosToReais } from '../../utils/formatters'

type Props = {
  stage: StageCardData
  onEdit?: (stage: StageCardData) => void
  onDelete?: (stage: StageCardData) => void
}

export function StageCard({ stage, onEdit, onDelete }: Props) {
  return (
    <div className="rounded border p-3 flex items-start justify-between" style={{ borderColor: stage.cor }}>
      <div className="flex flex-col gap-1">
        <div className="font-medium" style={{ color: stage.cor }}>
          {stage.nome}
        </div>
        <div className="text-xs text-muted-foreground">
          {stage.isInicial ? 'Estágio inicial' : stage.isFinal ? 'Estágio final' : 'Estágio intermediário'}
        </div>
        {stage.cobraCreditos && (
          <div className="text-xs">Cobra créditos: {formatCentavosToReais(stage.custoCentavos)}</div>
        )}
      </div>
      <div className="flex gap-2">
        <button className="text-blue-600 text-sm" onClick={() => onEdit?.(stage)}>Editar</button>
        <button className="text-red-600 text-sm" onClick={() => onDelete?.(stage)}>Excluir</button>
      </div>
    </div>
  )
}

export default StageCard

