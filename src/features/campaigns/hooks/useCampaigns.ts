import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/shared/hooks/use-toast'
import type {
  Campaign,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignsResponse,
  CampaignStats,
  CampaignAnalytics,
  CampaignContact,
  CampaignExecution,
  CampaignTemplate,
  CampaignVariant,
  CampaignIntegration,
  CampaignContactsParams
} from '../types/campaigns'
import * as campaignService from '../services/campaigns'

// Query Keys
const QUERY_KEYS = {
  campaigns: ['campaigns'] as const,
  campaign: (id: string) => ['campaigns', id] as const,
  campaignStats: ['campaigns', 'stats'] as const,
  campaignAnalytics: (id: string, startDate: string, endDate: string) =>
    ['campaigns', id, 'analytics', startDate, endDate] as const,
  campaignContacts: (id: string) => ['campaigns', id, 'contacts'] as const,
  campaignExecutions: (id: string) => ['campaigns', id, 'executions'] as const,
  campaignTemplates: ['campaigns', 'templates'] as const,
  campaignVariants: (id: string) => ['campaigns', id, 'variants'] as const,
  campaignIntegrations: (id: string) => ['campaigns', id, 'integrations'] as const,
}

// Campaign List Hook
export function useCampaigns(filters: CampaignFilters = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.campaigns, filters],
    queryFn: () => campaignService.fetchCampaigns(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// Single Campaign Hook
export function useCampaign(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campaign(id),
    queryFn: () => campaignService.fetchCampaign(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Campaign Stats Hook
export function useCampaignStats(filters?: Partial<CampaignFilters>) {
  return useQuery({
    queryKey: [...QUERY_KEYS.campaignStats, filters],
    queryFn: () => campaignService.fetchCampaignStats(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Campaign Analytics Hook
export function useCampaignAnalytics(campaignId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campaignAnalytics(campaignId, startDate, endDate),
    queryFn: () => campaignService.fetchCampaignAnalytics(campaignId, startDate, endDate),
    enabled: !!campaignId && !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  })
}

// Campaign Contacts Hook
export function useCampaignContacts(
  campaignId: string, 
  params?: CampaignContactsParams
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.campaignContacts(campaignId), params],
    queryFn: () => campaignService.fetchCampaignContacts(campaignId, params),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000,
  })
}

// Campaign Executions Hook
export function useCampaignExecutions(campaignId: string, filters?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.campaignExecutions(campaignId), filters],
    queryFn: () => campaignService.fetchCampaignExecutions(campaignId, filters),
    enabled: !!campaignId,
    staleTime: 1 * 60 * 1000, // 1 minute - executions change frequently
  })
}

// Campaign Templates Hook
export function useCampaignTemplates(filters?: { tipo?: string; categoria?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.campaignTemplates, filters],
    queryFn: () => campaignService.fetchCampaignTemplates(filters),
    staleTime: 30 * 60 * 1000, // 30 minutes - templates don't change often
  })
}

// Campaign Variants Hook (A/B Testing)
export function useCampaignVariants(campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campaignVariants(campaignId),
    queryFn: () => campaignService.fetchCampaignVariants(campaignId),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000,
  })
}

// Campaign Integrations Hook
export function useCampaignIntegrations(campaignId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.campaignIntegrations(campaignId),
    queryFn: () => campaignService.fetchCampaignIntegrations(campaignId),
    enabled: !!campaignId,
    staleTime: 10 * 60 * 1000,
  })
}

// MUTATIONS

// Create Campaign Mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignData) => campaignService.createCampaign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignStats })
      toast({
        title: 'Campanha criada',
        description: `${data.nome} foi criada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Update Campaign Mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCampaignData) => campaignService.updateCampaign(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.setQueryData(QUERY_KEYS.campaign(data.id), data)
      toast({
        title: 'Campanha atualizada',
        description: `${data.nome} foi atualizada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Delete Campaign Mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignStats })
      toast({
        title: 'Campanha excluída',
        description: 'A campanha foi excluída com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Campaign Action Mutations
export function useStartCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.startCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.setQueryData(QUERY_KEYS.campaign(data.id), data)
      toast({
        title: 'Campanha iniciada',
        description: `${data.nome} foi iniciada com sucesso.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function usePauseCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.pauseCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.setQueryData(QUERY_KEYS.campaign(data.id), data)
      toast({
        title: 'Campanha pausada',
        description: `${data.nome} foi pausada.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao pausar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useResumeCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.resumeCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.setQueryData(QUERY_KEYS.campaign(data.id), data)
      toast({
        title: 'Campanha retomada',
        description: `${data.nome} foi retomada.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao retomar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useStopCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.stopCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.setQueryData(QUERY_KEYS.campaign(data.id), data)
      toast({
        title: 'Campanha parada',
        description: `${data.nome} foi parada.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao parar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Clone Campaign Mutation
export function useCloneCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, newName }: { campaignId: string; newName: string }) =>
      campaignService.cloneCampaign(campaignId, newName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      toast({
        title: 'Campanha clonada',
        description: `${data.nome} foi criada como cópia.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao clonar campanha',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Bulk Operations
export function useBulkUpdateCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<UpdateCampaignData> }) =>
      campaignService.updateCampaignsBulk(ids, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignStats })
      toast({
        title: 'Campanhas atualizadas',
        description: 'As campanhas selecionadas foram atualizadas em lote.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar campanhas',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useBulkDeleteCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => campaignService.deleteCampaignsBulk(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignStats })
      toast({
        title: 'Campanhas excluídas',
        description: 'As campanhas selecionadas foram excluídas em lote.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir campanhas',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Contact Management
export function useAddContactsToCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, contactIds }: { campaignId: string; contactIds: string[] }) =>
      campaignService.addContactsToCampaign(campaignId, contactIds),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignContacts(campaignId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(campaignId) })
      toast({
        title: 'Contatos adicionados',
        description: 'Os contatos foram adicionados à campanha.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao adicionar contatos',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

export function useRemoveContactFromCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, contactId }: { campaignId: string; contactId: string }) =>
      campaignService.removeContactFromCampaign(campaignId, contactId),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignContacts(campaignId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaign(campaignId) })
      toast({
        title: 'Contato removido',
        description: 'O contato foi removido da campanha.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover contato',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// A/B Testing
export function useCreateCampaignVariant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, variant }: {
      campaignId: string;
      variant: Omit<CampaignVariant, 'id' | 'campaignId' | 'dataCriacao'>
    }) => campaignService.createCampaignVariant(campaignId, variant),
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaignVariants(campaignId) })
      toast({
        title: 'Variante criada',
        description: 'A variante da campanha foi criada para teste A/B.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar variante',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Test Campaign
export function useTestCampaign() {
  return useMutation({
    mutationFn: ({ campaignId, testContacts }: { campaignId: string; testContacts: string[] }) =>
      campaignService.testCampaign(campaignId, testContacts),
    onSuccess: (results) => {
      toast({
        title: 'Teste concluído',
        description: `Campanha testada com ${results.results.length} contatos.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no teste',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      })
    },
  })
}

// Advanced Hooks for Dashboard
export function useCampaignsDashboard() {
  const campaignsQuery = useCampaigns({ ativas: true })
  const statsQuery = useCampaignStats()

  return {
    campaigns: campaignsQuery.data?.campaigns || [],
    stats: statsQuery.data,
    isLoading: campaignsQuery.isLoading || statsQuery.isLoading,
    error: campaignsQuery.error || statsQuery.error,
  }
}