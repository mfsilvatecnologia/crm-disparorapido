import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../../shared/services/client';

interface PurchaseCreditPackageResponse {
  paymentUrl: string;
  transacaoId: string;
}

interface PurchaseCreditPackageParams {
  packageId: string;
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
}

/**
 * Hook for purchasing credit packages
 */
export function usePurchaseCreditPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PurchaseCreditPackageParams) => {
      return await apiClient.post<PurchaseCreditPackageResponse>(
        '/api/v1/credits/packages/purchase',
        data
      );
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
