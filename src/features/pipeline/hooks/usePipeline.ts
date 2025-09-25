import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/hooks/use-toast'
import type {
  Deal,
  PipelineStage,
  DealActivity,
  PipelineFilters,
  CreateDealData,
  UpdateDealData,
  DealsResponse,
  PipelineStats,
  CreateStageData,
  UpdateStageData,
  StagesResponse,
  DealMove,
  CreateActivityData,
  UpdateActivityData,
  ActivitiesResponse,
  PipelineDashboard,
  PipelineForecast
} from '../types/pipeline'
import * as pipelineService from '../services/pipeline'

// Query Keys
const QUERY_KEYS = {
  deals: ['deals'] as const,
  deal: (id: string) => ['deals', id] as const,
  stages: ['pipeline-stages'] as const,
  stage: (id: string) => ['pipeline-stages', id] as const,
  activities: (dealId: string) => ['deal-activities', dealId] as const,
  activity: (id: string) => ['deal-activities', 'single', id] as const,
  pipelineStats: ['pipeline', 'stats'] as const,
  pipelineDashboard: ['pipeline', 'dashboard'] as const,
  pipelineForecast: ['pipeline', 'forecast'] as const,
}

// Deals Hooks
export function useDeals(filters: PipelineFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.deals, filters],
    queryFn: () => pipelineService.fetchDeals(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.deal(id),
    queryFn: () => pipelineService.fetchDeal(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Pipeline Stages Hooks
export function usePipelineStages() {
  return useQuery({
    queryKey: QUERY_KEYS.stages,
    queryFn: () => pipelineService.fetchStages(),
    staleTime: 10 * 60 * 1000, // 10 minutes - stages don't change often
  })
}

export function usePipelineStage(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.stage(id),
    queryFn: () => pipelineService.fetchStage(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  })
}

// Deal Activities Hooks
export function useDealActivities(dealId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...QUERY_KEYS.activities(dealId), page, limit],
    queryFn: () => pipelineService.fetchDealActivities(dealId, page, limit),
    enabled: !!dealId,
    staleTime: 30 * 1000, // 30 seconds - activities change frequently
  })
}

// Pipeline Statistics
export function usePipelineStats(filters?: Partial<PipelineFilters>) {
  return useQuery({
    queryKey: [...QUERY_KEYS.pipelineStats, filters],
    queryFn: () => pipelineService.fetchPipelineStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Pipeline Dashboard
export function usePipelineDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.pipelineDashboard,
    queryFn: () => pipelineService.fetchPipelineDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Pipeline Forecast
export function usePipelineForecast(periodoMeses = 3) {
  return useQuery({
    queryKey: [...QUERY_KEYS.pipelineForecast, periodoMeses],
    queryFn: () => pipelineService.fetchPipelineForecast(periodoMeses),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// MUTATIONS

// Deal Mutations
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateDealData) => pipelineService.createDeal(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineDashboard })
      toast({
        title: 'Negócio criado',
        description: `${data.titulo} foi criado com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar negócio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateDealData) => pipelineService.updateDeal(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.setQueryData(QUERY_KEYS.deal(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      toast({
        title: 'Negócio atualizado',
        description: `${data.titulo} foi atualizado com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar negócio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pipelineService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineDashboard })
      toast({
        title: 'Negócio excluído',
        description: 'O negócio foi excluído com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir negócio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useMoveDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (moveData: DealMove) => pipelineService.moveDeal(moveData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.setQueryData(QUERY_KEYS.deal(data.id), data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      toast({
        title: 'Negócio movido',
        description: `${data.titulo} foi movido para uma nova etapa.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao mover negócio',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useConvertLeadToDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, dealData }: { leadId: string; dealData: Partial<CreateDealData> }) =>
      pipelineService.convertLeadToDeal(leadId, dealData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineDashboard })
      toast({
        title: 'Lead convertido',
        description: `${data.titulo} foi criado a partir do lead.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao converter lead',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Stage Mutations
export function useCreateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStageData) => pipelineService.createStage(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages })
      toast({
        title: 'Etapa criada',
        description: `${data.nome} foi criada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar etapa',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateStageData) => pipelineService.updateStage(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages })
      queryClient.setQueryData(QUERY_KEYS.stage(data.id), data)
      toast({
        title: 'Etapa atualizada',
        description: `${data.nome} foi atualizada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar etapa',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pipelineService.deleteStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      toast({
        title: 'Etapa excluída',
        description: 'A etapa foi excluída com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir etapa',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useReorderStages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (stageIds: string[]) => pipelineService.reorderStages(stageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stages })
      toast({
        title: 'Etapas reordenadas',
        description: 'A ordem das etapas foi atualizada.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao reordenar etapas',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Activity Mutations
export function useCreateDealActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateActivityData) => pipelineService.createDealActivity(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities(data.dealId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deal(data.dealId) })
      toast({
        title: 'Atividade criada',
        description: `${data.titulo} foi criada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar atividade',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateDealActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateActivityData) => pipelineService.updateDealActivity(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities(data.dealId) })
      queryClient.setQueryData(QUERY_KEYS.activity(data.id), data)
      toast({
        title: 'Atividade atualizada',
        description: `${data.titulo} foi atualizada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar atividade',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteDealActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pipelineService.deleteDealActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities })
      toast({
        title: 'Atividade excluída',
        description: 'A atividade foi excluída com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir atividade',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useCompleteDealActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, resultado, notes }: { id: string; resultado?: 'positivo' | 'neutro' | 'negativo'; notes?: string }) =>
      pipelineService.completeDealActivity(id, resultado, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activities(data.dealId) })
      queryClient.setQueryData(QUERY_KEYS.activity(data.id), data)
      toast({
        title: 'Atividade completada',
        description: `${data.titulo} foi marcada como completa.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao completar atividade',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Bulk Operations
export function useBulkUpdateDeals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ dealIds, updates }: { dealIds: string[]; updates: Partial<UpdateDealData> }) =>
      pipelineService.updateDealsBulk(dealIds, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      toast({
        title: 'Negócios atualizados',
        description: 'Os negócios selecionados foram atualizados em lote.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar negócios',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useBulkDeleteDeals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dealIds: string[]) => pipelineService.deleteDealsBulk(dealIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pipelineStats })
      toast({
        title: 'Negócios excluídos',
        description: 'Os negócios selecionados foram excluídos em lote.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir negócios',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Advanced Hooks
export function usePipelineBoard(filters: PipelineFilters = {}) {
  const stagesQuery = usePipelineStages()
  const dealsQuery = useDeals(filters)

  const boardData = React.useMemo(() => {
    if (!stagesQuery.data?.stages || !dealsQuery.data?.deals) return []

    return stagesQuery.data.stages
      .filter(stage => stage.isActive)
      .sort((a, b) => a.ordem - b.ordem)
      .map(stage => ({
        stage,
        deals: dealsQuery.data!.deals.filter(deal => deal.stageId === stage.id),
        totalValue: dealsQuery.data!.deals
          .filter(deal => deal.stageId === stage.id)
          .reduce((sum, deal) => sum + deal.valor, 0),
        count: dealsQuery.data!.deals.filter(deal => deal.stageId === stage.id).length
      }))
  }, [stagesQuery.data, dealsQuery.data])

  return {
    boardData,
    isLoading: stagesQuery.isLoading || dealsQuery.isLoading,
    error: stagesQuery.error || dealsQuery.error,
    refetch: () => {
      stagesQuery.refetch()
      dealsQuery.refetch()
    }
  }
}

// Dashboard Hook
export function useDashboardData() {
  const dashboardQuery = usePipelineDashboard()
  const statsQuery = usePipelineStats()
  const forecastQuery = usePipelineForecast()

  return {
    dashboard: dashboardQuery.data,
    stats: statsQuery.data,
    forecast: forecastQuery.data,
    isLoading: dashboardQuery.isLoading || statsQuery.isLoading || forecastQuery.isLoading,
    error: dashboardQuery.error || statsQuery.error || forecastQuery.error,
  }
}

// Import React for useMemo
import React from 'react'