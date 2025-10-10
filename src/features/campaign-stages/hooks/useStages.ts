import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import {
  fetchCampaignStages,
  createCampaignStage,
  updateCampaignStage,
  deleteCampaignStage,
  reorderCampaignStages,
} from '../services/stages'
import { QUERY_KEYS, CACHE_TIMES } from '../types/constants'
import type { CampaignLeadStage, CreateStageRequest, UpdateStageRequest } from '../types'

export function useCampaignStages(filters?: { includeInactive?: boolean; categoria?: CampaignLeadStage['categoria'] }) {
  return useQuery({
    queryKey: QUERY_KEYS.stages(filters),
    queryFn: () => fetchCampaignStages(filters),
    staleTime: CACHE_TIMES.medium,
    gcTime: CACHE_TIMES.long,
  })
}

export function useCreateCampaignStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStageRequest) => createCampaignStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-stages'] })
      toast.success('Estágio criado com sucesso')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Falha ao criar estágio')
    },
  })
}

export function useUpdateCampaignStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageRequest }) => updateCampaignStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-stages'] })
      toast.success('Estágio atualizado com sucesso')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Falha ao atualizar estágio')
    },
  })
}

export function useDeleteCampaignStage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaignStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-stages'] })
      toast.success('Estágio removido com sucesso')
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Falha ao remover estágio')
    },
  })
}

export function useReorderCampaignStages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (stages: Array<{ id: string; ordem: number }>) => reorderCampaignStages(stages),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-stages'] })
      toast.success('Ordem dos estágios atualizada')
    },
    onError: () => {
      toast.error('Falha ao reordenar estágios')
    },
  })
}

