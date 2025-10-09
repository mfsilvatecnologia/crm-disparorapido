/**
 * PaymentDetailsPage
 * Detailed view of a single payment with action buttons
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import { usePaymentDetails } from '../hooks/payments/usePaymentDetails';
import { PaymentStatusBadge } from '../components/payments/PaymentStatusBadge';
import { PaymentActions } from '../components/payments/PaymentActions';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Payment } from '../types';

/**
 * Payment method labels
 */
const PAYMENT_METHOD_LABELS = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  boleto: 'Boleto',
} as const;

/**
 * PaymentDetailsPage Component
 */
export function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading, isError, error } = usePaymentDetails(id!);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (isError || !payment) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar pagamento</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Não foi possível carregar os detalhes do pagamento.'}
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/payments')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/payments')}
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Detalhes do Pagamento
            </h1>
          </div>
          <p className="text-muted-foreground">ID: {payment.id}</p>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Valor</p>
            <p className="text-3xl font-bold">{formatCurrency(payment.amount)}</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Método de Pagamento</p>
              <p className="text-base">{PAYMENT_METHOD_LABELS[payment.method]}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p className="text-base">{formatDate(payment.createdAt, { includeTime: true })}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
              <p className="text-base">{formatDate(payment.updatedAt, { includeTime: true })}</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="text-base">{payment.description}</p>
            </div>

            {payment.subscriptionId && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Assinatura Relacionada</p>
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={() => navigate(`/subscriptions/${payment.subscriptionId}`)}
                >
                  {payment.subscriptionId}
                </Button>
              </div>
            )}

            {(payment as any).transactionId && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">ID da Transação</p>
                <p className="text-base font-mono text-sm">{(payment as any).transactionId}</p>
              </div>
            )}

            {(payment as any).receiptUrl && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Recibo</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open((payment as any).receiptUrl, '_blank')}
                >
                  Baixar Recibo
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Ações</p>
            <PaymentActions payment={payment} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
