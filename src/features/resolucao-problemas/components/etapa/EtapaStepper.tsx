import type { WorkflowEtapa } from '../../types/etapa.types'
import { EtapaStatus } from '../../types/etapa.types'
import { ProgressBar } from '../shared/ProgressBar'

interface EtapaStepperProps {
  etapas: WorkflowEtapa[]
}

export function EtapaStepper({ etapas }: EtapaStepperProps) {
  if (!etapas.length) return null

  const concluidas = etapas.filter((etapa) => etapa.status === EtapaStatus.CONCLUIDA).length
  const progress = Math.round((concluidas / etapas.length) * 100)

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Etapas concluidas</span>
        <span className="text-muted-foreground">
          {concluidas} de {etapas.length}
        </span>
      </div>
      <div className="mt-2">
        <ProgressBar value={progress} />
      </div>
    </div>
  )
}
