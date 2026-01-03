import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  CreateOpportunityPayload,
  LoseOpportunityPayload,
  Opportunity,
  OpportunityApi,
  OpportunityFilters,
  OpportunitiesResponse,
  UpdateOpportunityPayload,
  WinOpportunityPayload,
  WinOpportunityResponse,
  WinOpportunityResponseApi,
} from '../types/opportunity';

const OPPORTUNITIES_BASE_PATH = '/api/v1/opportunities';

const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters?: OpportunityFilters) => [...opportunityKeys.lists(), filters ?? {}] as const,
  detail: (id: string) => [...opportunityKeys.all, 'detail', id] as const,
};

function normalizeOpportunity(payload: OpportunityApi): Opportunity {
  const data = payload as OpportunityApi & { lost_reason?: string | null };
  return {
    id: data.id,
    leadId: data.lead_id ?? null,
    nome: data.nome,
    descricao: data.descricao ?? null,
    valorEstimado: Number(data.valor_estimado),
    probabilidade: data.probabilidade,
    estagio: data.estagio,
    status: data.status,
    expectedCloseDate: data.expected_close_date,
    motivoPerdida: data.motivo_perdida ?? data.lost_reason ?? null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function normalizeListResponse(response: any): OpportunitiesResponse {
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
    data: items.map(normalizeOpportunity),
    nextCursor,
    total,
  };
}

function updateOpportunityInPages(
  oldData: any,
  opportunityId: string,
  updater: (current: Opportunity) => Opportunity
) {
  if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page: OpportunitiesResponse) => ({
      ...page,
      data: page.data.map((item) => (item.id === opportunityId ? updater(item) : item)),
    })),
  };
}

function applyOpportunityUpdate(current: Opportunity, updates: Partial<Opportunity>): Opportunity {
  return {
    ...current,
    ...updates,
  };
}

function buildOpportunityParams(filters: OpportunityFilters = {}, cursor?: string | null) {
  const params: Record<string, unknown> = {
    limit: 20,
  };

  if (cursor) {
    params.cursor = cursor;
  }

  if (filters.stage) {
    params.stage = filters.stage;
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.minValue) {
    params.minValue = filters.minValue;
  }

  if (filters.maxValue) {
    params.maxValue = filters.maxValue;
  }

  if (filters.dateFrom) {
    params.dateFrom = filters.dateFrom;
  }

  if (filters.dateTo) {
    params.dateTo = filters.dateTo;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

function toCreatePayload(data: CreateOpportunityPayload) {
  // Backend expects full ISO datetime, convert date-only to ISO datetime
  const expectedCloseDate = data.expectedCloseDate
    ? data.expectedCloseDate.includes('T')
      ? data.expectedCloseDate
      : new Date(data.expectedCloseDate + 'T12:00:00').toISOString()
    : null;

  return {
    lead_id: data.leadId ?? null,
    nome: data.nome,
    descricao: data.descricao ?? null,
    valor_estimado: data.valorEstimado,
    probabilidade: data.probabilidade,
    estagio: data.estagio,
    expected_close_date: expectedCloseDate,
  };
}

function toUpdatePayload(data: UpdateOpportunityPayload) {
  // Backend expects full ISO datetime, convert date-only to ISO datetime
  const expectedCloseDate = data.expectedCloseDate
    ? data.expectedCloseDate.includes('T')
      ? data.expectedCloseDate
      : new Date(data.expectedCloseDate + 'T12:00:00').toISOString()
    : undefined;

  return {
    nome: data.nome,
    descricao: data.descricao,
    valor_estimado: data.valorEstimado,
    probabilidade: data.probabilidade,
    estagio: data.estagio,
    expected_close_date: expectedCloseDate,
  };
}

export function useOpportunities(filters?: OpportunityFilters) {
  return useInfiniteQuery({
    queryKey: opportunityKeys.list(filters),
    queryFn: async ({ pageParam }) => {
      const params = buildOpportunityParams(filters ?? {}, pageParam ?? null);
      const response = await apiClient.get(OPPORTUNITIES_BASE_PATH, { params });
      return normalizeListResponse(response);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`${OPPORTUNITIES_BASE_PATH}/${id}`);
      const payload = (response as any)?.data ?? response;
      return normalizeOpportunity(payload as OpportunityApi);
    },
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOpportunityPayload) => {
      const response = await apiClient.post(OPPORTUNITIES_BASE_PATH, toCreatePayload(data));
      const payload = (response as any)?.data ?? response;
      return normalizeOpportunity(payload as OpportunityApi);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOpportunityPayload) => {
      const response = await apiClient.patch(
        `${OPPORTUNITIES_BASE_PATH}/${data.id}`,
        toUpdatePayload(data)
      );
      const payload = (response as any)?.data ?? response;
      return normalizeOpportunity(payload as OpportunityApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousDetail = queryClient.getQueryData<Opportunity>(opportunityKeys.detail(data.id));

      const updates: Partial<Opportunity> = {
        nome: data.nome ?? previousDetail?.nome,
        descricao: data.descricao ?? previousDetail?.descricao ?? null,
        valorEstimado: data.valorEstimado ?? previousDetail?.valorEstimado,
        probabilidade: data.probabilidade ?? previousDetail?.probabilidade,
        estagio: data.estagio ?? previousDetail?.estagio,
        expectedCloseDate: data.expectedCloseDate ?? previousDetail?.expectedCloseDate,
      };

      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old) =>
        updateOpportunityInPages(old, data.id, (current) => applyOpportunityUpdate(current, updates))
      );

      queryClient.setQueryData(opportunityKeys.detail(data.id), (old?: Opportunity) =>
        old ? applyOpportunityUpdate(old, updates) : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_error, data, context) => {
      context?.previousLists?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(opportunityKeys.detail(data.id), context.previousDetail);
      }
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.setQueryData(opportunityKeys.detail(updated.id), updated);
    },
  });
}

function toWinPayload(data: WinOpportunityPayload) {
  // Backend expects full ISO datetime, convert date-only to ISO datetime
  const formatDateTime = (date: string) =>
    date.includes('T') ? date : new Date(date + 'T12:00:00').toISOString();

  return {
    customer_nome: data.customerNome,
    customer_email: data.customerEmail ?? null,
    customer_telefone: data.customerTelefone ?? null,
    customer_cnpj: data.customerCnpj ?? null,
    categoria: data.categoria,
    contract_value: data.contractValue,
    contract_start_date: formatDateTime(data.contractStartDate),
    contract_renewal_date: formatDateTime(data.contractRenewalDate),
  };
}

export function useWinOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opportunityId, ...winData }: { opportunityId: string } & WinOpportunityPayload) => {
      const response = await apiClient.post(
        `${OPPORTUNITIES_BASE_PATH}/${opportunityId}/win`,
        toWinPayload(winData)
      );
      const responseData = (response as any)?.data ?? response;
      const parsed = responseData as WinOpportunityResponseApi['data'];
      return {
        opportunity: normalizeOpportunity(parsed.opportunity),
        customer: parsed.customer,
      } as WinOpportunityResponse;
    },
    onMutate: async ({ opportunityId }) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousDetail = queryClient.getQueryData<Opportunity>(opportunityKeys.detail(opportunityId));

      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old) =>
        updateOpportunityInPages(old, opportunityId, (current) =>
          applyOpportunityUpdate(current, { status: 'won', estagio: 'Ganha' })
        )
      );

      queryClient.setQueryData(opportunityKeys.detail(opportunityId), (old?: Opportunity) =>
        old ? applyOpportunityUpdate(old, { status: 'won', estagio: 'Ganha' }) : old
      );

      return { previousLists, previousDetail, opportunityId };
    },
    onError: (_error, _variables, context) => {
      context?.previousLists?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (context?.previousDetail && context?.opportunityId) {
        queryClient.setQueryData(opportunityKeys.detail(context.opportunityId), context.previousDetail);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useLoseOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ opportunityId, motivoPerdida }: { opportunityId: string } & LoseOpportunityPayload) => {
      const response = await apiClient.post(
        `${OPPORTUNITIES_BASE_PATH}/${opportunityId}/lose`,
        { lost_reason: motivoPerdida }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeOpportunity(payload as OpportunityApi);
    },
    onMutate: async ({ opportunityId, motivoPerdida }) => {
      await queryClient.cancelQueries({ queryKey: opportunityKeys.lists() });
      const previousLists = queryClient.getQueriesData({ queryKey: opportunityKeys.lists() });
      const previousDetail = queryClient.getQueryData<Opportunity>(opportunityKeys.detail(opportunityId));

      queryClient.setQueriesData({ queryKey: opportunityKeys.lists() }, (old) =>
        updateOpportunityInPages(old, opportunityId, (current) =>
          applyOpportunityUpdate(current, { status: 'lost', estagio: 'Perdida', motivoPerdida })
        )
      );

      queryClient.setQueryData(opportunityKeys.detail(opportunityId), (old?: Opportunity) =>
        old ? applyOpportunityUpdate(old, { status: 'lost', estagio: 'Perdida', motivoPerdida }) : old
      );

      return { previousLists, previousDetail };
    },
    onError: (_error, variables, context) => {
      context?.previousLists?.forEach(([key, value]) => {
        queryClient.setQueryData(key, value);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(opportunityKeys.detail(variables.opportunityId), context.previousDetail);
      }
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.setQueryData(opportunityKeys.detail(updated.id), updated);
    },
  });
}
