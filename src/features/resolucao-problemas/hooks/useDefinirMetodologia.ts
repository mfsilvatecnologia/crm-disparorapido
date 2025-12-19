import { useMutation, useQueryClient } from '@tanstack/react-query'
import { projetoService } from '../services/projetoService'
import type { Metodologia, Projeto } from '../types/projeto.types'

interface DefinirMetodologiaVariables {
  projetoId: string
  metodologia: Metodologia
}

export function useDefinirMetodologia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projetoId, metodologia }: DefinirMetodologiaVariables) =>
      projetoService.definirMetodologia(projetoId, { metodologia }),
    onMutate: async ({ projetoId, metodologia }) => {
      await queryClient.cancelQueries({ queryKey: ['projeto', projetoId] })

      const previousProjeto = queryClient.getQueryData<Projeto>([
        'projeto',
        projetoId
      ])

      if (previousProjeto) {
        queryClient.setQueryData<Projeto>(['projeto', projetoId], {
          ...previousProjeto,
          metodologia,
          pode_definir_metodologia: false
        })
      }

      return { previousProjeto }
    },
    onError: (_error, variables, context) => {
      if (context?.previousProjeto) {
        queryClient.setQueryData(
          ['projeto', variables.projetoId],
          context.previousProjeto
        )
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projeto', variables.projetoId] })
      queryClient.invalidateQueries({ queryKey: ['projetos'] })
    }
  })
}
