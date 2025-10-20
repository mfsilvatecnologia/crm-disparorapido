/**
 * PaymentCard Component
 * Displays a single payment in card format
 */

import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { PaymentCardProps } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PaymentStatusBadge } from './PaymentStatusBadge';

/**
 * Billing type labels in Portuguese (Backend API)
 */
const BILLING_TYPE_LABELS = {
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  UNDEFINED: 'Não definido',
} as const;

/**
 * PaymentCard Component
 * 
 * @param payment - Payment data
 * @param isCorrupted - Whether the payment data is corrupted
 * @param onClick - Click handler for navigation
 */
export function PaymentCard({ 
  payment, 
  isCorrupted = false,
  onClick 
}: PaymentCardProps) {
  return (
    <Card 
      className={`
        cursor-pointer 
        transition-all 
        hover:shadow-md 
        hover:border-primary
        ${isCorrupted ? 'border-red-500 bg-red-50' : ''}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            {formatCurrency(payment.value)}
          </h3>
          {isCorrupted && (
            <AlertCircle className="h-4 w-4 text-red-500" aria-label="Dados corrompidos" />
          )}
        </div>
        <PaymentStatusBadge status={payment.status} />
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {payment.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{BILLING_TYPE_LABELS[payment.billingType]}</span>
            <span>Vencimento: {formatDate(payment.dueDate)}</span>
          </div>
          
          {payment.paymentDate && (
            <div className="text-xs text-muted-foreground">
              Pago em: {formatDate(payment.paymentDate)}
            </div>
          )}
          
          {payment.netValue !== payment.value && (
            <div className="text-xs text-muted-foreground">
              Valor líquido: {formatCurrency(payment.netValue)}
            </div>
          )}
          
          {payment.invoiceUrl && (
            <a
              href={payment.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver fatura
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
