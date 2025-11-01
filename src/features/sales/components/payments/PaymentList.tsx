/**
 * PaymentList Component
 * Displays a list of payments with loading and error states
 */

import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { PaymentCard } from './PaymentCard';
import { usePaymentHistory } from '../../hooks/payments/usePaymentHistory';
import { PaymentListParams } from '../../types';
import { isCorruptedPayment } from '../../types/guards';

interface PaymentListProps {
  params: PaymentListParams;
}

/**
 * PaymentList Component
 */
export function PaymentList({ params }: PaymentListProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = usePaymentHistory(params);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-muted animate-pulse rounded-lg"
            aria-label="Carregando pagamento"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar pagamentos</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Ocorreu um erro ao buscar os pagamentos.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!data?.data || data.data.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Nenhum pagamento encontrado</AlertTitle>
        <AlertDescription>
          Não há pagamentos que correspondam aos filtros selecionados.
        </AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <div className="space-y-4">
      {data.data.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          isCorrupted={isCorruptedPayment(payment)}
          onClick={() => navigate(`/app/payments/${payment.id}`)}
        />
      ))}
      
      {/* Pagination info */}
      <div className="text-sm text-muted-foreground text-center py-4">
        Mostrando {data.data.length} de {data.totalCount} pagamentos
      </div>
    </div>
  );
}
