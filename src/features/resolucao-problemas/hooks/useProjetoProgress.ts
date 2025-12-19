import type { Projeto } from '../types/projeto.types'
import { EtapaStatus } from '../types/etapa.types'

export function useProjetoProgress(projeto?: Projeto) {
  if (!projeto) return 0

  if (typeof projeto.progresso_percentual === 'number' && projeto.progresso_percentual > 0) {
    return projeto.progresso_percentual
  }

  const etapas = projeto.etapas ?? []
  if (!etapas.length) return 0

  const concluidas = etapas.filter((etapa) => etapa.status === EtapaStatus.CONCLUIDA).length
  return Math.round((concluidas / etapas.length) * 100)
}
