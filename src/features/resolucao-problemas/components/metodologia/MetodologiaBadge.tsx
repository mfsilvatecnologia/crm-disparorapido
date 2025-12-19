import { Badge } from '@/shared/components/ui/badge'
import { Metodologia } from '../../types/projeto.types'

interface MetodologiaBadgeProps {
  metodologia: Metodologia | null
}

const labelMap: Record<Metodologia, string> = {
  [Metodologia.MASP]: 'MASP',
  [Metodologia.OITO_D]: '8D',
  [Metodologia.A3]: 'A3'
}

export function MetodologiaBadge({ metodologia }: MetodologiaBadgeProps) {
  if (!metodologia) {
    return <Badge variant="secondary">Pendente</Badge>
  }

  return <Badge>{labelMap[metodologia]}</Badge>
}
