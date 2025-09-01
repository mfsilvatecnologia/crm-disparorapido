import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import type { CreateLeadDTO, UpdateLeadDTO } from '@/lib/api/schemas';

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
  return useQuery({
    queryKey: leadKeys.list(params || {}),
    queryFn: () => apiClient.getLeads(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
