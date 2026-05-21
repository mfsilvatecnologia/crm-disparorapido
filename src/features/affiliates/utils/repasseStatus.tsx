import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

/** Verde Disparo Rápido — uso localizado (ex.: aba Notas fiscais), sem alterar o tema global do CRM. */
export const disparoBrand = {
  green: 'hsl(142.1 70.6% 45.3%)',
  greenHover: 'hsl(142.1 70.6% 38%)',
  stepBadge: 'bg-[hsl(142.1_70.6%_45.3%)] text-white',
  icon: 'text-[hsl(142.1_70.6%_45.3%)]',
  uploadActive: 'border-[hsl(142.1_70.6%_45.3%)]/40 bg-[hsl(142.1_70.6%_45.3%)]/5',
  btn: 'bg-[hsl(142.1_70.6%_45.3%)] text-white hover:bg-[hsl(142.1_70.6%_38%)] focus-visible:ring-green-600',
} as const;

export const REPASSE_STATUS_LABEL: Record<string, string> = {
  aguardando_nf: 'Aguardando NF',
  nf_enviada: 'NF enviada',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  pago: 'Pago',
  divergencia: 'Divergência',
  cancelado: 'Cancelado',
};

function repasseStatusTone(status: string) {
  switch (status) {
    case 'pago':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'aprovado':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'em_analise':
    case 'nf_enviada':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'divergencia':
    case 'cancelado':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

export function RepasseStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        repasseStatusTone(status)
      )}
    >
      {REPASSE_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function RepasseStatusIcon({ status, className }: { status: string; className?: string }) {
  const cnIcon = cn('h-4 w-4 shrink-0', className);
  if (status === 'pago') return <CheckCircle className={cn(cnIcon, 'text-emerald-600')} />;
  if (status === 'divergencia' || status === 'cancelado') {
    return <AlertCircle className={cn(cnIcon, 'text-red-500')} />;
  }
  return <Clock className={cn(cnIcon, 'text-amber-500')} />;
}

export function formatPeriodoReferencia(periodo: string) {
  if (/^\d{4}-\d{2}$/.test(periodo)) {
    const [y, m] = periodo.split('-');
    const d = new Date(Number(y), Number(m) - 1, 1);
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);
  }
  return periodo;
}

export function formatMoneyCentavos(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
