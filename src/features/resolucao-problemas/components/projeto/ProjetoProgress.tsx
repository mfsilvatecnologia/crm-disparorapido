import { ProgressBar } from '../shared/ProgressBar'
import type { Projeto } from '../../types/projeto.types'
import { useProjetoProgress } from '../../hooks/useProjetoProgress'

interface ProjetoProgressProps {
  projeto: Projeto
}

export function ProjetoProgress({ projeto }: ProjetoProgressProps) {
  const progress = useProjetoProgress(projeto)

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Progresso do projeto</div>
        <div className="text-sm text-muted-foreground">{progress}%</div>
      </div>
      <div className="mt-2">
        <ProgressBar value={progress} />
      </div>
    </div>
  )
}
