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
  disponivel: 'Disponível',
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
    case 'disponivel':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
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
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
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

/** Ex.: "2026-05" → "05/2026" */
export function formatPeriodoReferenciaCurto(periodo: string) {
  if (/^\d{4}-\d{2}$/.test(periodo)) {
    const [y, m] = periodo.split('-');
    return `${m}/${y}`;
  }
  return periodo;
}

export function isRepasseStatusBloqueado(status: string) {
  return ['nf_enviada', 'em_analise', 'aprovado', 'pago', 'aguardando_nf'].includes(status);
}

export function formatMoneyCentavos(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export interface RepasseHistoricoStatusItem {
  id: string;
  status_anterior: string | null;
  status_novo: string;
  observacao?: string | null;
  alterado_por_user_id?: string | null;
  alterado_por_nome?: string | null;
  alterado_por_tipo: 'admin' | 'afiliado' | 'sistema';
  created_at: string;
}

export function resolveMotivoAdminRepasse(params: {
  status?: string | null;
  adminObservacao?: string | null;
  historicoStatus?: RepasseHistoricoStatusItem[] | null;
}): string | null {
  if (params.status !== 'divergencia' && params.status !== 'cancelado') return null;
  const fromField = params.adminObservacao?.trim();
  if (fromField) return fromField;
  const fromHistory = [...(params.historicoStatus ?? [])]
    .reverse()
    .find(
      (h) =>
        (h.status_novo === 'divergencia' || h.status_novo === 'cancelado') &&
        h.observacao?.trim()
    )
    ?.observacao?.trim();
  return fromHistory || null;
}

/** @deprecated Use resolveMotivoAdminRepasse */
export function resolveMotivoDivergencia(params: {
  adminObservacao?: string | null;
  historicoStatus?: RepasseHistoricoStatusItem[] | null;
}): string | null {
  return resolveMotivoAdminRepasse({
    status: 'divergencia',
    adminObservacao: params.adminObservacao,
    historicoStatus: params.historicoStatus,
  });
}

function formatRepasseHistoricoDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatRepasseHistoricoActor(item: RepasseHistoricoStatusItem) {
  if (item.alterado_por_nome?.trim()) return item.alterado_por_nome.trim();
  if (item.alterado_por_tipo === 'afiliado') return 'Afiliado';
  if (item.alterado_por_tipo === 'admin') return 'Equipe';
  return 'Sistema';
}

function repasseHistoricoDotClass(status: string, isMostRecent: boolean) {
  if (status === 'pago') {
    return 'bg-emerald-500 ring-emerald-500';
  }
  if (status === 'divergencia' || status === 'cancelado') {
    return 'bg-red-500 ring-red-500';
  }
  if (isMostRecent) {
    return 'bg-slate-700 ring-slate-700';
  }
  return 'bg-slate-300 ring-slate-300';
}

export function RepasseStatusHistoricoTimeline({
  items,
  title = 'Histórico',
  className,
}: {
  items: RepasseHistoricoStatusItem[];
  title?: string;
  className?: string;
}) {
  if (!items.length) return null;

  const orderedItems = [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{title}</p>
      <ol className="relative ml-1.5 space-y-0 border-l border-slate-200 pl-4">
        {orderedItems.map((item, index) => {
          const isLast = index === orderedItems.length - 1;
          const isMostRecent = index === 0;
          return (
            <li key={item.id} className={cn('relative pb-3', isLast && 'pb-0')}>
              <span
                className={cn(
                  'absolute -left-[1.125rem] top-1.5 h-2 w-2 rounded-full border-2 border-white ring-1',
                  repasseHistoricoDotClass(item.status_novo, isMostRecent)
                )}
              />
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-xs font-medium text-slate-800">
                  {REPASSE_STATUS_LABEL[item.status_novo] ?? item.status_novo}
                </p>
                <p className="shrink-0 text-[11px] tabular-nums text-slate-400">
                  {formatRepasseHistoricoDate(item.created_at)}
                </p>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {formatRepasseHistoricoActor(item)}
                {item.observacao?.trim() ? (
                  <>
                    <span className="mx-1 text-slate-300">·</span>
                    <span className="text-slate-600">{item.observacao.trim()}</span>
                  </>
                ) : null}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
