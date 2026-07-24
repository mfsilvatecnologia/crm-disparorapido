import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, subDays } from 'date-fns';
import { AlertTriangle, Gift, Loader2, RotateCcw, ShoppingCart, UserCheck, UserCog, UserMinus, Users, type LucideIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  adminReportsApi,
  type AdminClientsStatusReport,
  type AdminNewSubscriptionReportCategory,
  type AdminNewSubscriptionReportRow,
} from '../api/adminReportsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/utils/utils';

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatAxisDate(date: string) {
  try {
    return format(parseISO(date), 'dd/MM');
  } catch {
    return date;
  }
}

function formatCompactMoney(value: number) {
  if (value <= 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(part: number, total: number) {
  if (total <= 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

type MetricTone = 'positive' | 'negative' | 'neutral';

const POSITIVE_CATEGORIES = new Set<AdminNewSubscriptionReportCategory>([
  'plano_mensal',
  'plano_anual',
  'teste_gratis_mensal',
  'teste_gratis_anual',
]);

const NEGATIVE_CATEGORIES = new Set<AdminNewSubscriptionReportCategory>([
  'teste_expirado_mensal',
  'teste_expirado_anual',
  'assinaturas_canceladas_mensal',
  'assinaturas_canceladas_anual',
  'estorno_mensal',
  'estorno_anual',
  'teste_gratis_cancelados',
]);

function rowTone(category: AdminNewSubscriptionReportCategory): MetricTone {
  if (POSITIVE_CATEGORIES.has(category)) return 'positive';
  if (NEGATIVE_CATEGORIES.has(category)) return 'negative';
  return 'neutral';
}

type MetricSum = { quantity: number; value: number; pix: number; card: number };

function sumRows(rows: AdminNewSubscriptionReportRow[], categories: AdminNewSubscriptionReportCategory[]): MetricSum {
  return rows
    .filter((row) => categories.includes(row.category))
    .reduce(
      (acc, row) => ({
        quantity: acc.quantity + row.quantity,
        value: acc.value + row.value,
        pix: acc.pix + row.pix,
        card: acc.card + row.card,
      }),
      { quantity: 0, value: 0, pix: 0, card: 0 }
    );
}

const CLIENT_GAUGES = [
  {
    key: 'active' as const,
    title: 'Ativos',
    color: '#059669',
    track: '#d1fae5',
    soft: 'bg-emerald-50/80 border-emerald-100',
    icon: UserCheck,
  },
  {
    key: 'internal' as const,
    title: 'Internos',
    color: '#475569',
    track: '#e2e8f0',
    soft: 'bg-slate-50 border-slate-200',
    icon: UserCog,
  },
  {
    key: 'delinquent' as const,
    title: 'Inadimplentes',
    color: '#d97706',
    track: '#fef3c7',
    soft: 'bg-amber-50/80 border-amber-100',
    icon: AlertTriangle,
  },
  {
    key: 'canceled' as const,
    title: 'Cancelados',
    color: '#dc2626',
    track: '#fee2e2',
    soft: 'bg-red-50/80 border-red-100',
    icon: UserMinus,
  },
  {
    key: 'refunded' as const,
    title: 'Estornados',
    color: '#7c3aed',
    track: '#ede9fe',
    soft: 'bg-violet-50/80 border-violet-100',
    icon: RotateCcw,
  },
];

function SpeedometerGauge({
  title,
  value,
  max,
  color,
  track,
  soft,
  icon: Icon,
  caption,
}: {
  title: string;
  value: number;
  max: number;
  color: string;
  track: string;
  soft: string;
  icon: LucideIcon;
  caption: string;
}) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const radius = 58;
  const stroke = 11;
  const cx = 80;
  const cy = 78;
  const arcLength = Math.PI * radius;
  const dash = (percent / 100) * arcLength;
  const arcPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <div className={cn('rounded-xl border px-3 pb-3 pt-3 shadow-sm', soft)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: track, color }}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <p className="truncate text-sm font-medium text-slate-700">{title}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-500">
          {percent.toFixed(0)}%
        </span>
      </div>

      <div className="relative mx-auto h-[96px] w-[160px]">
        <svg viewBox="0 0 160 96" className="h-full w-full" aria-hidden>
          <path
            d={arcPath}
            fill="none"
            stroke={track}
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${arcLength}`}
            className="transition-[stroke-dasharray] duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="text-3xl font-bold tabular-nums leading-none tracking-tight" style={{ color }}>
            {value}
          </p>
        </div>
      </div>

      <p className="mt-2 text-center text-[11px] text-slate-500">{caption}</p>
    </div>
  );
}

function ClientsStatusGauge({ data }: { data: AdminClientsStatusReport }) {
  const universe = Math.max(data.total + data.internal, 1);
  const values = {
    active: data.active,
    internal: data.internal,
    delinquent: data.delinquent,
    canceled: data.canceled,
    refunded: data.refunded,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-sky-700/80">
          Total de clientes
        </p>
        <p className="mt-0.5 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
          {data.total}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">sem contas internas</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CLIENT_GAUGES.map((item) => (
          <SpeedometerGauge
            key={item.key}
            title={item.title}
            value={values[item.key]}
            max={universe}
            color={item.color}
            track={item.track}
            soft={item.soft}
            icon={item.icon}
            caption={
              item.key === 'internal'
                ? 'Não entra no total'
                : `${formatPercent(values[item.key], data.total)} do total`
            }
          />
        ))}
      </div>
    </div>
  );
}

function MoneyWithShare({
  amount,
  total,
  tone,
}: {
  amount: number;
  total: number;
  tone: MetricTone;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 tabular-nums">
      <span
        className={cn(
          'leading-none',
          tone === 'positive' && 'text-emerald-600',
          tone === 'negative' && 'text-red-600'
        )}
      >
        {formatMoney(amount)}
      </span>
      <span className="rounded bg-muted px-1.5 py-px text-[10px] leading-none text-muted-foreground">
        {formatPercent(amount, total)}
      </span>
    </div>
  );
}

function SummaryMetric({
  title,
  quantity,
  value,
  tone,
  icon: Icon,
}: {
  title: string;
  quantity: number;
  value: number;
  tone: 'positive' | 'negative';
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3.5 py-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          tone === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-semibold tabular-nums leading-none">{quantity}</span>
          <span
            className={cn(
              'text-sm font-medium tabular-nums',
              tone === 'positive' ? 'text-emerald-600' : 'text-red-600'
            )}
          >
            {formatMoney(value)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminReportsTab() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);

  const applyPeriodPreset = (days: number | 'month') => {
    const end = new Date();
    const start = days === 'month' ? startOfMonth(end) : subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
  };

  const reportQuery = useQuery({
    queryKey: ['admin-new-subscriptions-report', startDate, endDate],
    queryFn: () => adminReportsApi.getNewSubscriptionsReport({ startDate, endDate }),
  });

  const clientsStatusQuery = useQuery({
    queryKey: ['admin-clients-status-report'],
    queryFn: () => adminReportsApi.getClientsStatusReport(),
  });

  const report = reportQuery.data;
  const rows = report?.rows ?? [];
  const clientsStatus = clientsStatusQuery.data;

  const summary = {
    active: sumRows(rows, ['plano_mensal', 'plano_anual']),
    trials: sumRows(rows, ['teste_gratis_mensal', 'teste_gratis_anual']),
    canceled: sumRows(rows, ['assinaturas_canceladas_mensal', 'assinaturas_canceladas_anual']),
    canceledTrials: sumRows(rows, ['teste_gratis_cancelados']),
  };

  const chartData = (report?.timeline ?? []).map((point) => ({
    ...point,
    label: formatAxisDate(point.date),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Status de clientes</CardTitle>
              <CardDescription className="text-xs">
                Visão atual do estoque por empresa. O total exclui contas internas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {clientsStatusQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando status...
            </div>
          ) : clientsStatusQuery.isError || !clientsStatus ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Não foi possível carregar o status de clientes.
            </div>
          ) : (
            <ClientsStatusGauge data={clientsStatus} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3 p-4 pb-3">
          <div>
            <CardTitle className="text-lg">Extrato sintético</CardTitle>
            <CardDescription className="text-xs">
              Novas assinaturas, testes e cancelamentos no período, com split PIX/cartão.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => applyPeriodPreset(7)}>
                7 dias
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => applyPeriodPreset(30)}>
                30 dias
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => applyPeriodPreset(90)}>
                90 dias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => applyPeriodPreset('month')}
              >
                Mês atual
              </Button>
            </div>
            <Input
              type="date"
              className="h-8 w-auto"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Data inicial"
            />
            <Input
              type="date"
              className="h-8 w-auto"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Data final"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          {reportQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando relatório...
            </div>
          ) : reportQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Não foi possível carregar o relatório. Tente novamente.
            </div>
          ) : (
            <>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                  title="Assinaturas novas ativas"
                  quantity={summary.active.quantity}
                  value={summary.active.value}
                  tone="positive"
                  icon={ShoppingCart}
                />
                <SummaryMetric
                  title="Testes aguardando conversão"
                  quantity={summary.trials.quantity}
                  value={summary.trials.value}
                  tone="positive"
                  icon={Gift}
                />
                <SummaryMetric
                  title="Assinaturas canceladas"
                  quantity={summary.canceled.quantity}
                  value={summary.canceled.value}
                  tone="negative"
                  icon={UserMinus}
                />
                <SummaryMetric
                  title="Testes grátis cancelados"
                  quantity={summary.canceledTrials.quantity}
                  value={summary.canceledTrials.value}
                  tone="negative"
                  icon={Gift}
                />
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead className="h-11 w-[32%] bg-sky-600 px-3 text-left text-sm font-semibold text-white first:rounded-tl-md">
                        Categoria
                      </TableHead>
                      <TableHead className="h-11 w-[12%] bg-sky-600 px-3 text-center text-sm font-semibold text-white">
                        Qtd
                      </TableHead>
                      <TableHead className="h-11 w-[18%] bg-sky-600 px-3 text-center text-sm font-semibold text-white">
                        Valor
                      </TableHead>
                      <TableHead className="h-11 w-[19%] bg-sky-600 px-3 text-center text-sm font-semibold text-white">
                        PIX
                      </TableHead>
                      <TableHead className="h-11 w-[19%] bg-sky-600 px-3 text-center text-sm font-semibold text-white last:rounded-tr-md">
                        Cartão
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const tone = rowTone(row.category);
                      return (
                        <TableRow key={row.category}>
                          <TableCell className="px-3 py-2.5 text-left text-sm font-medium align-middle">
                            {row.label}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm tabular-nums align-middle">
                            {row.quantity}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'px-3 py-2.5 text-center text-sm tabular-nums align-middle',
                              tone === 'positive' && 'text-emerald-600',
                              tone === 'negative' && 'text-red-600'
                            )}
                          >
                            {formatMoney(row.value)}
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                            <MoneyWithShare amount={row.pix} total={row.value} tone={tone} />
                          </TableCell>
                          <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                            <MoneyWithShare amount={row.card} total={row.value} tone={tone} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-sky-50 hover:bg-sky-50">
                      <TableCell className="px-3 py-2.5 text-left text-sm font-semibold text-sky-950 align-middle">
                        Total assinaturas novas ativas
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-sky-950 align-middle">
                        {summary.active.quantity}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-emerald-600 align-middle">
                        {formatMoney(summary.active.value)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                        <MoneyWithShare
                          amount={summary.active.pix}
                          total={summary.active.value}
                          tone="positive"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                        <MoneyWithShare
                          amount={summary.active.card}
                          total={summary.active.value}
                          tone="positive"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-sky-50 hover:bg-sky-50">
                      <TableCell className="px-3 py-2.5 text-left text-sm font-semibold text-sky-950 align-middle">
                        Testes grátis aguardando conversão
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-sky-950 align-middle">
                        {summary.trials.quantity}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm font-semibold tabular-nums text-emerald-600 align-middle">
                        {formatMoney(summary.trials.value)}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                        <MoneyWithShare
                          amount={summary.trials.pix}
                          total={summary.trials.value}
                          tone="positive"
                        />
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-center text-sm align-middle">
                        <MoneyWithShare
                          amount={summary.trials.card}
                          total={summary.trials.value}
                          tone="positive"
                        />
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg">Linha do tempo: faturamento diário</CardTitle>
          <CardDescription className="text-xs">
            Plano mensal, anual e assinaturas canceladas por dia.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {reportQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando gráfico...
            </div>
          ) : reportQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              Não foi possível carregar o gráfico. Tente novamente.
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={40}
                    tickFormatter={(value: number) =>
                      new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        monthly: 'Plano Mensal',
                        yearly: 'Plano Anual',
                        canceled: 'Assinaturas Canceladas',
                        total: 'Total',
                      };
                      return [formatMoney(value), labels[name] ?? name];
                    }}
                    labelFormatter={(label) => `Dia ${label}`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => {
                      if (value === 'monthly') return 'Plano Mensal';
                      if (value === 'yearly') return 'Plano Anual';
                      if (value === 'canceled') return 'Assinaturas Canceladas';
                      return value;
                    }}
                  />
                  <Bar dataKey="monthly" name="monthly" stackId="billing" fill="#3b82f6" />
                  <Bar dataKey="yearly" name="yearly" stackId="billing" fill="#10b981" />
                  <Bar dataKey="canceled" name="canceled" stackId="billing" fill="#ef4444" radius={[4, 4, 0, 0]}>
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(value: number) => formatCompactMoney(value)}
                      style={{ fontSize: 10, fill: '#334155' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
