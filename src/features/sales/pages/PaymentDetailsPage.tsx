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
 * Billing type labels (Backend API)
 */
const BILLING_TYPE_LABELS = {
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  UNDEFINED: 'Não definido',
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
            <p className="text-3xl font-bold">{formatCurrency(payment.value)}</p>
          </div>

          {payment.netValue !== payment.value && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Valor Líquido (após taxas)</p>
              <p className="text-xl font-semibold text-green-600">{formatCurrency(payment.netValue)}</p>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Forma de Pagamento</p>
              <p className="text-base">{BILLING_TYPE_LABELS[payment.billingType]}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Vencimento</p>
              <p className="text-base">{formatDate(payment.dueDate)}</p>
            </div>

            {payment.paymentDate && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Data de Pagamento</p>
                <p className="text-base">{formatDate(payment.paymentDate)}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p className="text-base">{formatDate(payment.createdAt)}</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Descrição</p>
              <p className="text-base">{payment.description}</p>
            </div>

            {payment.invoiceUrl && (
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Fatura</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(payment.invoiceUrl, '_blank')}
                >
                  Visualizar Fatura
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
