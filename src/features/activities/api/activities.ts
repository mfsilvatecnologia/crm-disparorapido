import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Activity, ActivityApi, CreateActivityPayload, UpdateActivityPayload } from '../types/activity';

const activityKeys = {
  all: ['activities'] as const,
  list: (customerId: string) => [...activityKeys.all, customerId] as const,
};

function normalizeActivity(payload: ActivityApi): Activity {
  return {
    id: payload.id,
    customerId: payload.customer_id,
    tipo: payload.tipo,
    descricao: payload.descricao,
    dataHora: payload.data_hora,
    userId: payload.user_id,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    deletedAt: payload.deleted_at,
  };
}

function updateActivityList(
  oldData: Activity[] | undefined,
  activityId: string,
  updater: (current: Activity) => Activity
) {
  if (!oldData) return oldData;
  return oldData.map((item) => (item.id === activityId ? updater(item) : item));
}

export function useActivities(customerId: string) {
  return useQuery({
    queryKey: activityKeys.list(customerId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/customers/${customerId}/activities`);
      const payload = (response as any)?.data ?? response;
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      return items.map(normalizeActivity);
    },
    enabled: !!customerId,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateActivityPayload) => {
      const response = await apiClient.post(
        `/api/v1/customers/${data.customerId}/activities`,
        {
          tipo: data.tipo,
          descricao: data.descricao,
          data_hora: data.dataHora,
        }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeActivity(payload as ActivityApi);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.list(variables.customerId) });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateActivityPayload & { customerId: string }) => {
      const response = await apiClient.patch(`/api/v1/activities/${data.id}`, {
        tipo: data.tipo,
        descricao: data.descricao,
        data_hora: data.dataHora,
      });
      const payload = (response as any)?.data ?? response;
      return normalizeActivity(payload as ActivityApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.list(data.customerId) });
      const previousList = queryClient.getQueryData<Activity[]>(activityKeys.list(data.customerId));

      queryClient.setQueryData<Activity[]>(activityKeys.list(data.customerId), (old) =>
        updateActivityList(old, data.id, (current) => ({
          ...current,
          tipo: data.tipo ?? current.tipo,
          descricao: data.descricao ?? current.descricao,
          dataHora: data.dataHora ?? current.dataHora,
        }))
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(activityKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.list(variables.customerId) });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, customerId }: { id: string; customerId: string }) => {
      await apiClient.delete(`/api/v1/activities/${id}`);
      return { id, customerId };
    },
    onMutate: async ({ id, customerId }) => {
      await queryClient.cancelQueries({ queryKey: activityKeys.list(customerId) });
      const previousList = queryClient.getQueryData<Activity[]>(activityKeys.list(customerId));

      queryClient.setQueryData<Activity[]>(activityKeys.list(customerId), (old) =>
        old ? old.filter((item) => item.id !== id) : old
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(activityKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.list(result.customerId) });
    },
  });
}
