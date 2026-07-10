/**
 * Conteúdo (inline/accordion) com o detalhe de um período de repasse:
 * clientes que geraram comissão no mês.
 */

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Users, Wallet, Receipt } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { affiliateKeys } from '@/features/affiliates/hooks/queryKeys';
import { disparoBrand, formatMoneyCentavos } from '@/features/affiliates/utils/repasseStatus';

export interface AffiliateRepasseMonthDetailContentProps {
  periodoReferencia: string;
  /** Só dispara a busca quando a persiana está aberta. */
  enabled?: boolean;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function billingCycleLabel(cycle: string | null): string {
  const c = String(cycle ?? '').toUpperCase();
  if (c === 'YEARLY' || c === 'ANNUAL' || c === 'ANNUALLY') return 'Anual';
  if (c === 'MONTHLY' || c === 'MONTH') return 'Mensal';
  return cycle ? cycle : '—';
}

export function AffiliateRepasseMonthDetailContent({
  periodoReferencia,
  enabled = true,
}: AffiliateRepasseMonthDetailContentProps) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: affiliateKeys.saldoMesDetalhe(periodoReferencia),
    queryFn: () => affiliatesApi.getAffiliateSaldoMesDetalhe(periodoReferencia),
    enabled,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <AlertCircle className="h-4 w-4" />
        {error instanceof Error ? error.message : 'Não foi possível carregar os detalhes.'}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Clientes
          </div>
          <p className="mt-1 text-lg font-semibold text-slate-900">{data.totalClientes}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" />
            Valor bruto
          </div>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {formatMoneyCentavos(data.valorBrutoCentavos)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className={`h-3.5 w-3.5 ${disparoBrand.icon}`} />
            Comissão
          </div>
          <p className="mt-1 text-lg font-semibold text-emerald-700">
            {formatMoneyCentavos(data.comissaoCentavos)}
          </p>
        </div>
      </div>

      {data.clientes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <Users className="h-8 w-8 opacity-30" />
          <p className="text-sm">Nenhum cliente gerou comissão neste mês.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Cliente</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.clientes.map((cliente, index) => (
                <TableRow key={`${cliente.empresaId ?? 'cliente'}-${index}`}>
                  <TableCell className="font-medium">{cliente.nomeEmpresa}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {billingCycleLabel(cliente.billingCycle)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(cliente.pagamentoEm)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-700">
                    {formatMoneyCentavos(cliente.comissaoCentavos)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
