/**
 * PaymentStatusBadge Component
 * Displays payment status with color-coded badge
 */

import { Badge } from '@/shared/components/ui/badge';
import { PaymentStatusBadgeProps } from '../../types';

/**
 * Status configuration mapping
 * Maps payment status to badge variant and label
 */
const STATUS_CONFIG = {
  pending: {
    variant: 'outline' as const,
    label: 'Pendente',
    className: 'border-yellow-500 text-yellow-700 bg-yellow-50',
  },
  completed: {
    variant: 'default' as const,
    label: 'Concluído',
    className: 'bg-green-500 text-white hover:bg-green-600',
  },
  failed: {
    variant: 'destructive' as const,
    label: 'Falhou',
    className: 'bg-red-500 text-white hover:bg-red-600',
  },
  cancelled: {
    variant: 'secondary' as const,
    label: 'Cancelado',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  },
  refunded: {
    variant: 'secondary' as const,
    label: 'Reembolsado',
    className: 'bg-gray-500 text-white hover:bg-gray-600',
  },
} as const;

/**
 * PaymentStatusBadge Component
 * 
 * @param status - Payment status
 * @param showLabel - Whether to show label text (default: true)
 */
export function PaymentStatusBadge({ 
  status, 
  showLabel = true 
}: PaymentStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge 
      variant={config.variant}
      className={config.className}
      aria-label={`Status: ${config.label}`}
    >
      {showLabel ? config.label : null}
    </Badge>
  );
}
