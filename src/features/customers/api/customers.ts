import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Customer,
  CustomerApi,
  CustomerFilters,
  CustomersResponse,
  UpdateCustomerPayload,
  UpdateCustomerStatusPayload,
} from '../types/customer';
import type { CustomerTimelineResponseApi, HealthScoreResponse, TimelineEvent } from '../types/timeline';

const CUSTOMERS_BASE_PATH = '/api/v1/customers';

const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (filters?: CustomerFilters) => [...customerKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
  timeline: (id: string) => [...customerKeys.all, 'timeline', id] as const,
  healthScore: (id: string) => [...customerKeys.all, 'health-score', id] as const,
};

function normalizeCustomer(payload: CustomerApi): Customer {
  return {
    id: payload.id,
    nome: payload.nome,
    cnpj: payload.cnpj ?? null,
    segmento: payload.segmento ?? null,
    status: payload.status,
    endereco: payload.endereco ?? null,
    telefone: payload.telefone ?? null,
    email: payload.email ?? null,
    notas: payload.notas ?? null,
    healthScore: payload.health_score ?? null,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function normalizeListResponse(response: any): CustomersResponse {
  if (!response || typeof response !== 'object') {
    return { data: [], nextCursor: null, total: 0 };
  }

  const dataNode = response.data ?? response;
  const items = Array.isArray(dataNode)
    ? dataNode
    : Array.isArray(dataNode.data)
      ? dataNode.data
      : [];

  // Only set nextCursor if there are items (to prevent infinite loop)
  const rawNextCursor =
    response.nextCursor ??
    dataNode.nextCursor ??
    response.pagination?.cursor ??
    dataNode.pagination?.cursor ??
    null;

  // Don't return nextCursor if no items returned (end of pagination)
  const nextCursor = items.length > 0 ? rawNextCursor : null;

  const total =
    response.total ??
    dataNode.total ??
    response.pagination?.count ??
    dataNode.pagination?.count ??
    items.length;

  return {
    data: items.map(normalizeCustomer),
    nextCursor,
    total,
  };
}

function updateCustomerInPages(
  oldData: any,
  customerId: string,
  updater: (current: Customer) => Customer
) {
  if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page: CustomersResponse) => ({
      ...page,
      data: page.data.map((item) => (item.id === customerId ? updater(item) : item)),
    })),
  };
}

function applyCustomerUpdate(current: Customer, updates: Partial<Customer>): Customer {
  return {
    ...current,
    ...updates,
  };
}

function buildCustomerParams(filters: CustomerFilters = {}, cursor?: string | null) {
  const params: Record<string, unknown> = { limit: 20 };
  if (cursor) params.cursor = cursor;
  if (filters.status) params.status = filters.status;
  if (filters.segmento) params.segmento = filters.segmento;
  if (filters.search) params.search = filters.search;
  return params;
}

function normalizeTimeline(response: CustomerTimelineResponseApi | any): TimelineEvent[] {
  const payload = (response as any)?.data ?? response;
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((event) => ({
    id: event.id,
    type: event.type,
    title: event.title,
    description: event.description ?? null,
    createdAt: event.created_at,
    metadata: event.metadata ?? null,
  }));
}

export function useCustomers(filters?: CustomerFilters) {
  return useInfiniteQuery({
    queryKey: customerKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      const params = buildCustomerParams(filters ?? {}, pageParam ?? null);
      const response = await apiClient.get(CUSTOMERS_BASE_PATH, { params });
      return normalizeListResponse(response);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`${CUSTOMERS_BASE_PATH}/${id}`);
      const payload = (response as any)?.data ?? response;
      return normalizeCustomer(payload as CustomerApi);
    },
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerPayload) => {
      const response = await apiClient.patch(`${CUSTOMERS_BASE_PATH}/${data.id}`, data);
      const payload = (response as any)?.data ?? response;
      return normalizeCustomer(payload as CustomerApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: customerKeys.lists() });
      const previousDetail = queryClient.getQueryData(customerKeys.detail(data.id));

      const updates: Partial<Customer> = {
        nome: data.nome ?? previousDetail?.nome,
        segmento: data.segmento ?? previousDetail?.segmento ?? null,
        endereco: data.endereco ?? previousDetail?.endereco ?? null,
        telefone: data.telefone ?? previousDetail?.telefone ?? null,
        email: data.email ?? previousDetail?.email ?? null,
        notas: data.notas ?? previousDetail?.notas ?? null,
      };

      queryClient.setQueriesData({ queryKey: customerKeys.lists() }, (old) =>
        updateCustomerInPages(old, data.id, (current) => applyCustomerUpdate(current, updates))
      );

      queryClient.setQueryData(customerKeys.detail(data.id), (old?: Customer) =>
        old ? applyCustomerUpdate(old, updates) : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_error, _data, context) => {
      context?.previousLists?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(customerKeys.detail(context.previousDetail.id), context.previousDetail);
      }
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
    },
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCustomerStatusPayload) => {
      const response = await apiClient.patch(
        `${CUSTOMERS_BASE_PATH}/${data.id}/status`,
        { status: data.status }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeCustomer(payload as CustomerApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: customerKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: customerKeys.lists() });
      const previousDetail = queryClient.getQueryData(customerKeys.detail(data.id));

      queryClient.setQueriesData({ queryKey: customerKeys.lists() }, (old) =>
        updateCustomerInPages(old, data.id, (current) => applyCustomerUpdate(current, { status: data.status }))
      );

      queryClient.setQueryData(customerKeys.detail(data.id), (old?: Customer) =>
        old ? applyCustomerUpdate(old, { status: data.status }) : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_error, variables, context) => {
      context?.previousLists?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(customerKeys.detail(variables.id), context.previousDetail);
      }
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.setQueryData(customerKeys.detail(updated.id), updated);
    },
  });
}

export function useCustomerTimeline(id: string) {
  return useQuery({
    queryKey: customerKeys.timeline(id),
    queryFn: async () => {
      const response = await apiClient.get(`${CUSTOMERS_BASE_PATH}/${id}/timeline`);
      return normalizeTimeline(response);
    },
    enabled: !!id,
  });
}

export function useHealthScore(id: string) {
  return useQuery({
    queryKey: customerKeys.healthScore(id),
    queryFn: async () => {
      const response = await apiClient.get(`${CUSTOMERS_BASE_PATH}/${id}/health-score`);
      const payload = (response as any)?.data ?? response;
      return payload as HealthScoreResponse;
    },
    enabled: !!id,
  });
}
