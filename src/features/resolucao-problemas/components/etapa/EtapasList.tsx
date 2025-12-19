import type { WorkflowEtapa } from '../../types/etapa.types'
import { EtapaCard } from './EtapaCard'
import { EtapaTimeline } from './EtapaTimeline'
import { EtapaStepper } from './EtapaStepper'
import { EmptyState } from '../shared/EmptyState'

interface EtapasListProps {
  etapas: WorkflowEtapa[]
}

export function EtapasList({ etapas }: EtapasListProps) {
  if (!etapas.length) {
    return (
      <EmptyState
        title="Nenhuma etapa cadastrada"
        description="Defina a metodologia para gerar as etapas automaticamente."
      />
    )
  }

  const ordenadas = [...etapas].sort((a, b) => a.ordem - b.ordem)

  return (
    <div className="space-y-6">
      <EtapaStepper etapas={ordenadas} />
      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <EtapaTimeline etapas={ordenadas} />
        <div className="grid gap-4">
          {ordenadas.map((etapa) => (
            <EtapaCard key={etapa.id} etapa={etapa} />
          ))}
        </div>
      </div>
    </div>
  )
}
