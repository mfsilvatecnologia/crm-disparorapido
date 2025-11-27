import { CommissionOriginType, CommissionStatus } from '../types';
import { formatCurrency } from '@/features/sales/utils/formatters';

export function formatCurrencyFromCents(value: number): string {
  return formatCurrency(value, { isCents: true });
}

export function formatOriginLabel(tipoOrigem: CommissionOriginType): string {
  const labels: Record<CommissionOriginType, string> = {
    subscription: 'Assinatura',
    subscription_payment: 'Pagamento Assinatura',
    credit_purchase: 'Compra de Créditos',
    subscription_renewal: 'Renovação',
  };

  return labels[tipoOrigem] || tipoOrigem;
}

export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatStatusLabel(status: CommissionStatus): string {
  const labels: Record<CommissionStatus, string> = {
    pending: 'Pendente',
    credited: 'Creditado',
    failed: 'Falhou',
  };

  return labels[status] || status;
}
