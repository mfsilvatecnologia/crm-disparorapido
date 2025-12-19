import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { projetoService } from '../services/projetoService'
import type { ListProjetosQuery } from '../types/api.types'

export function useProjetos(query: ListProjetosQuery) {
  return useQuery({
    queryKey: ['projetos', query],
    queryFn: () => projetoService.listar(query),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000
  })
}
