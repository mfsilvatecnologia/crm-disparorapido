import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, startOfMonth, subDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
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
import { adminReportsApi } from '../api/adminReportsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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

  const report = reportQuery.data;
  const chartData = (report?.timeline ?? []).map((point) => ({
    ...point,
    label: formatAxisDate(point.date),
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Período</CardTitle>
          <CardDescription>
            Extrato sintético de novas assinaturas e cancelamentos. Contas internas são excluídas
            automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => applyPeriodPreset(7)}>
              Últimos 7 dias
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPeriodPreset(30)}>
              Últimos 30 dias
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPeriodPreset(90)}>
              Últimos 90 dias
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPeriodPreset('month')}>
              Mês atual
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 max-w-xl">
            <div>
              <Label>Data inicial</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Data final</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Extrato sintético</CardTitle>
          <CardDescription>
            Novas assinaturas e cancelamentos no período selecionado, com valores por PIX e cartão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando relatório...
            </div>
          ) : reportQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Não foi possível carregar o relatório. Tente novamente.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">PIX</TableHead>
                    <TableHead className="text-right">Cartão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(report?.rows ?? []).map((row) => (
                    <TableRow key={row.category}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.value)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.pix)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(row.card)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {report?.totals && (
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {report.totals.quantity}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(report.totals.value)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(report.totals.pix)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatMoney(report.totals.card)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Linha do tempo — Faturamento diário</CardTitle>
          <CardDescription>
            Valores diários de plano mensal, plano anual e assinaturas canceladas. O topo de cada barra
            mostra o total somado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Carregando gráfico...
            </div>
          ) : reportQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Não foi possível carregar o gráfico. Tente novamente.
            </div>
          ) : (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 28, right: 12, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fontSize: 11 }}
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
                      style={{ fontSize: 11, fill: '#334155' }}
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
