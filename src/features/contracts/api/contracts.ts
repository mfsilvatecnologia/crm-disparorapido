import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Contract,
  ContractApi,
  CreateContractPayload,
  NearRenewalContract,
  NearRenewalContractApi,
  RenewContractPayload,
  UpdateContractPayload,
} from '../types/contract';

const contractKeys = {
  all: ['contracts'] as const,
  list: (customerId: string) => [...contractKeys.all, customerId] as const,
  nearRenewal: () => [...contractKeys.all, 'near-renewal'] as const,
};

function normalizeContract(payload: ContractApi): Contract {
  return {
    id: payload.id,
    customerId: payload.customer_id,
    numero: payload.numero,
    valor: payload.valor,
    moeda: payload.moeda ?? 'BRL',
    dataInicio: payload.data_inicio,
    dataFim: payload.data_fim,
    servicos: payload.servicos,
    condicoes: payload.condicoes ?? null,
    status: payload.status,
    arquivoUrl: payload.arquivo_url ?? null,
    contratoAnteriorId: payload.contrato_anterior_id ?? null,
    daysUntilEnd: payload.days_until_end,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function normalizeNearRenewal(payload: NearRenewalContractApi): NearRenewalContract {
  return {
    ...normalizeContract(payload),
    daysUntilRenewal: payload.days_until_renewal,
  };
}

function updateContractList(
  oldData: Contract[] | undefined,
  contractId: string,
  updater: (current: Contract) => Contract
) {
  if (!oldData) return oldData;
  return oldData.map((item) => (item.id === contractId ? updater(item) : item));
}

export function useContracts(customerId: string) {
  return useQuery({
    queryKey: contractKeys.list(customerId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/customers/${customerId}/contracts`);
      const payload = (response as any)?.data ?? response;
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      return items.map(normalizeContract);
    },
    enabled: !!customerId,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateContractPayload) => {
      // Convert date-only to ISO datetime if needed
      const formatDateTime = (date: string) =>
        date.includes('T') ? date : new Date(date + 'T12:00:00').toISOString();

      const response = await apiClient.post(
        `/api/v1/customers/${data.customerId}/contracts`,
        {
          numero: data.numero,
          valor: data.valor,
          data_inicio: formatDateTime(data.dataInicio),
          data_fim: formatDateTime(data.dataFim),
          servicos: data.servicos,
          moeda: data.moeda ?? 'BRL',
          condicoes: data.condicoes ?? null,
          status: data.status ?? 'VIGENTE',
        }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeContract(payload as ContractApi);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list(variables.customerId) });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateContractPayload & { customerId: string }) => {
      const response = await apiClient.patch(`/api/v1/contracts/${data.id}`, {
        valor: data.valor,
        servicos: data.servicos,
        condicoes: data.condicoes ?? null,
        status: data.status,
        arquivo_url: data.arquivoUrl ?? null,
      });
      const payload = (response as any)?.data ?? response;
      return normalizeContract(payload as ContractApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: contractKeys.list(data.customerId) });
      const previousList = queryClient.getQueryData<Contract[]>(contractKeys.list(data.customerId));

      queryClient.setQueryData<Contract[]>(contractKeys.list(data.customerId), (old) =>
        updateContractList(old, data.id, (current) => ({
          ...current,
          valor: data.valor ?? current.valor,
          servicos: data.servicos ?? current.servicos,
          condicoes: data.condicoes ?? current.condicoes,
          status: data.status ?? current.status,
          arquivoUrl: data.arquivoUrl ?? current.arquivoUrl,
        }))
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(contractKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list(variables.customerId) });
    },
  });
}

export function useNearRenewal() {
  return useQuery({
    queryKey: contractKeys.nearRenewal(),
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/contracts/near-renewal');
      const payload = (response as any)?.data ?? response;
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      return items.map(normalizeNearRenewal);
    },
  });
}

export function useRenewContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: RenewContractPayload & { customerId: string }) => {
      // Convert date-only to ISO datetime if needed
      const formatDateTime = (date: string) =>
        date.includes('T') ? date : new Date(date + 'T12:00:00').toISOString();

      const response = await apiClient.post(`/api/v1/contracts/${data.id}/renew`, {
        numero: data.numero,
        valor: data.valor,
        moeda: data.moeda ?? 'BRL',
        data_inicio: formatDateTime(data.dataInicio),
        data_fim: formatDateTime(data.dataFim),
        servicos: data.servicos,
        condicoes: data.condicoes ?? null,
        arquivo_url: data.arquivoUrl ?? null,
      });
      const payload = (response as any)?.data ?? response;
      return normalizeContract(payload as ContractApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: contractKeys.list(data.customerId) });
      const previousList = queryClient.getQueryData<Contract[]>(contractKeys.list(data.customerId));

      queryClient.setQueryData<Contract[]>(contractKeys.list(data.customerId), (old) =>
        updateContractList(old, data.id, (current) => ({
          ...current,
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          valor: data.valor,
          servicos: data.servicos ?? current.servicos,
          condicoes: data.condicoes ?? current.condicoes,
          status: 'RENOVADO',
        }))
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(contractKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.list(variables.customerId) });
      queryClient.invalidateQueries({ queryKey: contractKeys.nearRenewal() });
    },
  });
}
