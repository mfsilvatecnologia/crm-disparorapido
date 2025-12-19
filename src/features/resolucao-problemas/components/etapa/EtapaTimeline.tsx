import type { WorkflowEtapa } from '../../types/etapa.types'
import { EtapaStatus } from '../../types/etapa.types'

interface EtapaTimelineProps {
  etapas: WorkflowEtapa[]
}

const statusColor: Record<EtapaStatus, string> = {
  [EtapaStatus.PENDENTE]: 'bg-slate-300',
  [EtapaStatus.EM_ANDAMENTO]: 'bg-blue-500',
  [EtapaStatus.CONCLUIDA]: 'bg-emerald-500',
  [EtapaStatus.BLOQUEADA]: 'bg-red-500'
}

export function EtapaTimeline({ etapas }: EtapaTimelineProps) {
  if (!etapas.length) return null

  return (
    <div className="space-y-3">
      {etapas.map((etapa) => (
        <div key={etapa.id} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`h-3 w-3 rounded-full ${statusColor[etapa.status]}`} />
            <div className="h-10 w-px bg-border" />
          </div>
          <div>
            <div className="text-sm font-medium">{etapa.titulo}</div>
            <div className="text-xs text-muted-foreground">{etapa.descricao}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
