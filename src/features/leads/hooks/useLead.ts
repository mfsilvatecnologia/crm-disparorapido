import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/client';
import type { Lead } from '@/shared/services/schemas';

export const useLead = (id: string | undefined, options?: { enabled?: boolean }) => {
  return useQuery<Lead, Error>({
    queryKey: ['lead', id],
    queryFn: () => {
      if (!id) {
        throw new Error("Lead ID is required");
      }
      return apiClient.getLead(id);
    },
    enabled: !!id && (options?.enabled ?? true),
  });
};
