import { Badge } from '@/shared/components/ui/badge';
import { CommissionStatus } from '../types';
import { formatStatusLabel } from '../utils/formatters';

interface CommissionStatusBadgeProps {
  status: CommissionStatus;
}

const statusVariants: Record<CommissionStatus, 'default' | 'secondary' | 'destructive'> = {
  pending: 'secondary',
  credited: 'default',
  failed: 'destructive',
};

export function CommissionStatusBadge({ status }: CommissionStatusBadgeProps) {
  return <Badge variant={statusVariants[status]}>{formatStatusLabel(status)}</Badge>;
}
