import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateProjetoRequest } from '../types/api.types'
import { projetoService } from '../services/projetoService'

export function useCreateProjeto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProjetoRequest) => projetoService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] })
    }
  })
}

export function useProjeto(id?: string) {
  return useQuery({
    queryKey: ['projeto', id],
    queryFn: () => projetoService.buscarPorId(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000
  })
}
