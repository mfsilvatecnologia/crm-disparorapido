import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../../shared/services/client';

interface PurchaseCreditPackageResponse {
  paymentUrl: string;
  transacaoId: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
    mutationFn: async (data: PurchaseCreditPackageParams): Promise<PurchaseCreditPackageResponse> => {
      const response = await apiClient.post<ApiResponse<PurchaseCreditPackageResponse> | PurchaseCreditPackageResponse>(
        '/api/v1/credits/packages/purchase',
        data
      );

      console.log('Purchase response:', response);

      // Handle both envelope format { success, data } and direct format
      if (response && typeof response === 'object') {
        if ('success' in response && response.success && 'data' in response) {
          return response.data as PurchaseCreditPackageResponse;
        }
        if ('paymentUrl' in response) {
          return response as PurchaseCreditPackageResponse;
        }
      }

      throw new Error('Resposta inválida do servidor');
    },
    onSuccess: (data) => {
      // Invalida queries relacionadas a créditos
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });

      if (data.paymentUrl) {
        toast.success('Redirecionando para pagamento...');
      }
    },
    onError: (error: any) => {
      console.error('Purchase error:', error);
      const message =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        'Erro ao processar compra de créditos';
      toast.error(message);
    },
  });
}
