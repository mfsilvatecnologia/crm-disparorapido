import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import type { Projeto } from '../../types/projeto.types'
import { MetodologiaBadge } from '../metodologia/MetodologiaBadge'
import { ProjetoStatusBadge } from './ProjetoStatusBadge'

interface ProjetoCardProps {
  projeto: Projeto
  onSelect?: (id: string) => void
}

export function ProjetoCard({ projeto, onSelect }: ProjetoCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(projeto.id)
    }
  }

  return (
    <Card
      className={onSelect ? 'cursor-pointer transition-shadow hover:shadow-md' : undefined}
      onClick={handleClick}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">{projeto.titulo}</CardTitle>
          <ProjetoStatusBadge status={projeto.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MetodologiaBadge metodologia={projeto.metodologia} />
          <span className="text-xs text-muted-foreground">
            Lead: {projeto.cliente?.nome ?? projeto.cliente_id}
          </span>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {projeto.descricao}
      </CardContent>
    </Card>
  )
}
