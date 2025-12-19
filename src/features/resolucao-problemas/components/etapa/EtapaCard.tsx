import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { WorkflowEtapa } from '../../types/etapa.types'
import { EtapaStatus } from '../../types/etapa.types'

interface EtapaCardProps {
  etapa: WorkflowEtapa
}

const statusLabels: Record<EtapaStatus, string> = {
  [EtapaStatus.PENDENTE]: 'Pendente',
  [EtapaStatus.EM_ANDAMENTO]: 'Em andamento',
  [EtapaStatus.CONCLUIDA]: 'Concluida',
  [EtapaStatus.BLOQUEADA]: 'Bloqueada'
}

const statusClass: Record<EtapaStatus, string> = {
  [EtapaStatus.PENDENTE]: 'bg-slate-100 text-slate-700',
  [EtapaStatus.EM_ANDAMENTO]: 'bg-blue-100 text-blue-700',
  [EtapaStatus.CONCLUIDA]: 'bg-emerald-100 text-emerald-700',
  [EtapaStatus.BLOQUEADA]: 'bg-red-100 text-red-700'
}

export function EtapaCard({ etapa }: EtapaCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {etapa.ordem}. {etapa.titulo}
          </CardTitle>
          <span className={`rounded-full px-2 py-0.5 text-xs ${statusClass[etapa.status]}`}>
            {statusLabels[etapa.status]}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">Tipo: {etapa.tipo}</div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {etapa.descricao || 'Sem descricao adicional.'}
      </CardContent>
    </Card>
  )
}
