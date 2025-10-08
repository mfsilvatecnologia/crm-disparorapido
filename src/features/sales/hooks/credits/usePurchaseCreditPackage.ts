import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../../shared/services/client';
import { PurchaseCreditPackageSchema } from '../../schemas/credit.schema';

interface PurchaseCreditPackageResponse {
  paymentUrl: string;
  transacaoId: string;
}

/**
 * Hook for purchasing credit packages
 */
export function usePurchaseCreditPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseCreditPackageSchema) => {
      const response = await apiClient.post<PurchaseCreditPackageResponse>(
        '/credits/packages/purchase',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalida queries relacionadas a créditos
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
      
      toast.success('Redirecionando para pagamento...');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        'Erro ao processar compra de créditos';
      toast.error(message);
    },
  });
}
