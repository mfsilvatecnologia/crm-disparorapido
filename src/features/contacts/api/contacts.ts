import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  Contact,
  ContactApi,
  CreateContactPayload,
  UpdateContactPayload,
} from '../types/contact';

const contactsKeys = {
  all: ['contacts'] as const,
  list: (customerId: string) => [...contactsKeys.all, customerId] as const,
};

function normalizeContact(payload: ContactApi): Contact {
  return {
    id: payload.id,
    customerId: payload.customer_id,
    nome: payload.nome,
    email: payload.email,
    telefone: payload.telefone ?? null,
    cargo: payload.cargo ?? null,
    departamento: payload.departamento ?? null,
    isPrimary: payload.is_primary,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
}

function updateContactList(
  oldData: Contact[] | undefined,
  contactId: string,
  updater: (current: Contact) => Contact
) {
  if (!oldData) return oldData;
  return oldData.map((item) => (item.id === contactId ? updater(item) : item));
}

export function useContacts(customerId: string) {
  return useQuery({
    queryKey: contactsKeys.list(customerId),
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/customers/${customerId}/contacts`);
      const payload = (response as any)?.data ?? response;
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      return items.map(normalizeContact);
    },
    enabled: !!customerId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateContactPayload) => {
      const response = await apiClient.post(
        `/api/v1/customers/${data.customerId}/contacts`,
        {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone ?? null,
          cargo: data.cargo ?? null,
          departamento: data.departamento ?? null,
        }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeContact(payload as ContactApi);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.list(variables.customerId) });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateContactPayload) => {
      const response = await apiClient.patch(
        `/api/v1/customers/${data.customerId}/contacts/${data.id}`,
        {
          nome: data.nome,
          email: data.email,
          telefone: data.telefone ?? null,
          cargo: data.cargo ?? null,
          departamento: data.departamento ?? null,
        }
      );
      const payload = (response as any)?.data ?? response;
      return normalizeContact(payload as ContactApi);
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: contactsKeys.list(data.customerId) });
      const previousList = queryClient.getQueryData<Contact[]>(contactsKeys.list(data.customerId));

      queryClient.setQueryData<Contact[]>(contactsKeys.list(data.customerId), (old) =>
        updateContactList(old, data.id, (current) => ({
          ...current,
          nome: data.nome ?? current.nome,
          email: data.email ?? current.email,
          telefone: data.telefone ?? current.telefone,
          cargo: data.cargo ?? current.cargo,
          departamento: data.departamento ?? current.departamento,
        }))
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(contactsKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.list(variables.customerId) });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, id }: { customerId: string; id: string }) => {
      await apiClient.delete(`/api/v1/customers/${customerId}/contacts/${id}`);
      return { customerId, id };
    },
    onMutate: async ({ customerId, id }) => {
      await queryClient.cancelQueries({ queryKey: contactsKeys.list(customerId) });
      const previousList = queryClient.getQueryData<Contact[]>(contactsKeys.list(customerId));

      queryClient.setQueryData<Contact[]>(contactsKeys.list(customerId), (old) =>
        old ? old.filter((item) => item.id !== id) : old
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(contactsKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.list(result.customerId) });
    },
  });
}

export function useSetPrimaryContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, id }: { customerId: string; id: string }) => {
      const response = await apiClient.post(
        `/api/v1/customers/${customerId}/contacts/${id}/set-primary`
      );
      const payload = (response as any)?.data ?? response;
      return normalizeContact(payload as ContactApi);
    },
    onMutate: async ({ customerId, id }) => {
      await queryClient.cancelQueries({ queryKey: contactsKeys.list(customerId) });
      const previousList = queryClient.getQueryData<Contact[]>(contactsKeys.list(customerId));

      queryClient.setQueryData<Contact[]>(contactsKeys.list(customerId), (old) =>
        old
          ? old.map((item) => ({
              ...item,
              isPrimary: item.id === id,
            }))
          : old
      );

      return { previousList };
    },
    onError: (_error, variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(contactsKeys.list(variables.customerId), context.previousList);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contactsKeys.list(variables.customerId) });
    },
  });
}
