import { Badge } from '@/shared/components/ui/badge'
import { ProjetoStatus } from '../../types/projeto.types'

interface ProjetoStatusBadgeProps {
  status: ProjetoStatus
}

const statusLabels: Record<ProjetoStatus, string> = {
  [ProjetoStatus.PLANEJAMENTO]: 'Planejamento',
  [ProjetoStatus.EM_ANDAMENTO]: 'Em andamento',
  [ProjetoStatus.AGUARDANDO]: 'Aguardando',
  [ProjetoStatus.CONCLUIDO]: 'Concluido',
  [ProjetoStatus.CANCELADO]: 'Cancelado',
  [ProjetoStatus.ARQUIVADO]: 'Arquivado'
}

const statusClass: Record<ProjetoStatus, string> = {
  [ProjetoStatus.PLANEJAMENTO]: 'bg-slate-100 text-slate-700',
  [ProjetoStatus.EM_ANDAMENTO]: 'bg-blue-100 text-blue-700',
  [ProjetoStatus.AGUARDANDO]: 'bg-amber-100 text-amber-700',
  [ProjetoStatus.CONCLUIDO]: 'bg-emerald-100 text-emerald-700',
  [ProjetoStatus.CANCELADO]: 'bg-red-100 text-red-700',
  [ProjetoStatus.ARQUIVADO]: 'bg-gray-100 text-gray-700'
}

export function ProjetoStatusBadge({ status }: ProjetoStatusBadgeProps) {
  return (
    <Badge className={statusClass[status]} variant="secondary">
      {statusLabels[status]}
    </Badge>
  )
}
