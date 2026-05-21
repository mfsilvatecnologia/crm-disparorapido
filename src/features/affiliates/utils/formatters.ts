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

export function formatStatusLabel(status: CommissionStatus): string {
  const labels: Record<CommissionStatus, string> = {
    pending: 'Pendente',
    credited: 'Creditado',
    failed: 'Falhou',
  };

  return labels[status] || status;
}

/** Ciclo de cobrança da assinatura (valores em inglês no banco / Asaas). */
export function formatBillingCycleLabelPt(cycle: string | null | undefined): string {
  if (cycle == null || String(cycle).trim() === '') return '—';
  const key = String(cycle).trim().toUpperCase().replace(/-/g, '_');
  const labels: Record<string, string> = {
    WEEKLY: 'Semanal',
    BIWEEKLY: 'Quinzenal',
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMIANNUALLY: 'Semestral',
    SEMIANNUAL: 'Semestral',
    YEARLY: 'Anual',
    ANNUAL: 'Anual',
    DAILY: 'Diário',
  };
  return labels[key] ?? cycle;
}

export function formatPaymentMethodLabelPt(method: string | null | undefined): string {
  if (method == null || String(method).trim() === '') return '—';
  const key = String(method).trim().toUpperCase();
  const labels: Record<string, string> = {
    CREDIT_CARD: 'Cartão de crédito',
    PIX: 'PIX',
    BOLETO: 'Boleto',
    UNDEFINED: '—',
  };
  return labels[key] ?? method;
}

/** Rótulo do plano: produto cadastrado, depois ciclo de cobrança. */
export function formatClientePlanoLabel(row: {
  plano_label?: string | null;
  produto_nome?: string | null;
  billing_cycle?: string | null;
}): string {
  const nome = row.plano_label?.trim() || row.produto_nome?.trim();
  if (nome) return nome;
  return formatBillingCycleLabelPt(row.billing_cycle);
}

export function formatDatePt(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}
