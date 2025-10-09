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
 * Payment method labels in Portuguese
 */
const PAYMENT_METHOD_LABELS = {
  credit_card: 'Cartão de Crédito',
  pix: 'PIX',
  boleto: 'Boleto',
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
            {formatCurrency(payment.amount)}
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
            <span>{PAYMENT_METHOD_LABELS[payment.method]}</span>
            <span>{formatDate(payment.createdAt, { includeTime: true })}</span>
          </div>
          
          {payment.subscriptionId && (
            <p className="text-xs text-muted-foreground">
              Assinatura: {payment.subscriptionId}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
