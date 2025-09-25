import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/services/client';
import type { CreateLeadDTO, UpdateLeadDTO } from '@/shared/services/schemas';

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters: Record<string, string | number | boolean | string[] | undefined>) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

// Hooks for Leads
export function useLeads(params?: {
  page?: number;
  limit?: number;
  status?: string;
  scoreMin?: number;
  scoreMax?: number;
  segmento?: string;
  porteEmpresa?: string;
  fonte?: string;
  search?: string;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
}) {
  // Normalizar parâmetros para evitar cache misses desnecessários
  const normalizedParams = params ? {
    ...params,
    // Remover parâmetros undefined/null
    ...(Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined && value !== null && value !== '')
    ))
  } : {};

  return useQuery({
    queryKey: leadKeys.list(normalizedParams),
    queryFn: () => apiClient.getLeads(normalizedParams),
    retry: (failureCount, error) => {
      // Só retry em erros de rede, não em erros de cliente (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        if (status >= 400 && status < 500) {
          return false; // Não retry em erros 4xx
        }
      }
      return failureCount < 2; // Máximo 2 retries
    },
    retryDelay: 1000, // Delay fixo de 1s
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: false, // Não refetch ao montar se ainda não expirou
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => apiClient.getLead(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadDTO) => apiClient.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDTO }) =>
      apiClient.updateLead(id, data),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.setQueryData(leadKeys.detail(updatedLead.id), updatedLead);
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    },
  });
}
