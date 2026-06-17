import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CreditCard,
  ExternalLink,
  Layers,
  Loader2,
  Package,
  Puzzle,
  Receipt,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminFinancialApi, AdminPaymentCategory } from '../api/adminFinancialApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/utils/utils';

const PAYMENT_CATEGORIES: { value: 'all' | AdminPaymentCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Todos', icon: <Layers className="h-3.5 w-3.5" /> },
  { value: 'SUBSCRIPTION', label: 'Assinaturas', icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { value: 'EXTENSION', label: 'Extensão', icon: <Puzzle className="h-3.5 w-3.5" /> },
  { value: 'LEADS', label: 'Leads', icon: <Package className="h-3.5 w-3.5" /> },
  { value: 'OTHER', label: 'Outros', icon: <Receipt className="h-3.5 w-3.5" /> },
];

const CATEGORY_LABELS: Record<AdminPaymentCategory, string> = {
  SUBSCRIPTION: 'Assinatura',
  EXTENSION: 'Extensão',
  LEADS: 'Leads',
  OTHER: 'Outros',
};

const CATEGORY_BADGE_CLASS: Record<AdminPaymentCategory, string> = {
  SUBSCRIPTION: 'bg-blue-50 text-blue-700 border-blue-200',
  EXTENSION: 'bg-violet-50 text-violet-700 border-violet-200',
  LEADS: 'bg-amber-50 text-amber-800 border-amber-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return format(parsed, 'dd/MM/yyyy', { locale: ptBR });
}

function formatBillingType(value: string) {
  const normalized = value.toUpperCase();
  if (normalized === 'CREDIT_CARD') return 'Cartão';
  if (normalized === 'PIX') return 'PIX';
  if (normalized === 'BOLETO') return 'Boleto';
  return value;
}

function formatStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'Pendente';
    case 'RECEIVED':
      return 'Recebido';
    case 'CONFIRMED':
      return 'Confirmado';
    case 'OVERDUE':
      return 'Em atraso';
    case 'REFUNDED':
      return 'Estornado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const normalized = status.toUpperCase();
  if (normalized === 'CONFIRMED' || normalized === 'RECEIVED') return 'default';
  if (normalized === 'OVERDUE') return 'destructive';
  if (normalized === 'PENDING') return 'secondary';
  return 'outline';
}

function truncateText(text: string, max = 56) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

export function AdminFinancialTab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empresaFromQuery = searchParams.get('empresaId') ?? '';

  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [empresaFilter, setEmpresaFilter] = useState(empresaFromQuery);
  const [paymentCategory, setPaymentCategory] = useState<'all' | AdminPaymentCategory>('all');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [paymentOffset, setPaymentOffset] = useState(0);
  const limit = 15;

  const applyPeriodPreset = (days: number | 'month') => {
    const end = new Date();
    const start = days === 'month' ? startOfMonth(end) : subDays(end, days);
    setStartDate(format(start, 'yyyy-MM-dd'));
    setEndDate(format(end, 'yyyy-MM-dd'));
    setPaymentOffset(0);
  };

  useEffect(() => {
    if (empresaFromQuery) {
      setEmpresaFilter(empresaFromQuery);
      setPaymentOffset(0);
    }
  }, [empresaFromQuery]);

  const summaryQuery = useQuery({
    queryKey: ['admin-financial-summary', startDate, endDate],
    queryFn: () => adminFinancialApi.getSummary({ startDate, endDate }),
  });

  const paymentsQuery = useQuery({
    queryKey: [
      'admin-financial-payments',
      startDate,
      endDate,
      paymentStatus,
      empresaFilter,
      paymentCategory,
      paymentOffset,
    ],
    queryFn: () =>
      adminFinancialApi.listPayments({
        startDate,
        endDate,
        limit,
        offset: paymentOffset,
        status: paymentStatus === 'all' ? undefined : paymentStatus,
        empresaId: empresaFilter.trim() || undefined,
        category: paymentCategory === 'all' ? undefined : paymentCategory,
      }),
  });

  const summary = summaryQuery.data;
  const payments = paymentsQuery.data;
  const pageSummary = payments?.pageSummary;

  const visiblePayments = useMemo(() => {
    const search = descriptionSearch.trim().toLowerCase();
    if (!search) return payments?.data ?? [];
    return (payments?.data ?? []).filter(
      (payment) =>
        payment.description.toLowerCase().includes(search) ||
        (payment.empresaNome ?? '').toLowerCase().includes(search)
    );
  }, [payments?.data, descriptionSearch]);

  const openClientFinance = (empresaId: string) => {
    navigate(`/app/admin?tab=financeiro&empresaId=${encodeURIComponent(empresaId)}`);
    setEmpresaFilter(empresaId);
    setPaymentOffset(0);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Período e filtros</CardTitle>
            <CardDescription>
              Os indicadores de assinatura usam o intervalo abaixo. Pagamentos vêm do Asaas e podem ser
              filtrados por cliente e categoria.
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

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Data inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPaymentOffset(0);
                  }}
                />
              </div>
              <div>
                <Label>Data final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPaymentOffset(0);
                  }}
                />
              </div>
              <div>
                <Label>Empresa (ID)</Label>
                <Input
                  placeholder="UUID da empresa — deixe vazio para ver todos"
                  value={empresaFilter}
                  onChange={(e) => {
                    setEmpresaFilter(e.target.value);
                    setPaymentOffset(0);
                  }}
                />
                {empresaFromQuery && empresaFilter === empresaFromQuery && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Filtrando pagamentos do cliente selecionado na aba Clientes.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assinaturas</h2>
            <p className="text-sm text-muted-foreground">Panorama do SaaS no período selecionado.</p>
          </div>

          {summaryQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : summary ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">MRR estimado</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-blue-900">
                  {formatMoney(summary.estimatedMrr)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Assinaturas ativas</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.activeSubscriptions}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Em trial</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.trialingSubscriptions}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inadimplentes</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-destructive">
                  {summary.pastDueSubscriptions}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Venc. 7 dias</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.dueNext7Days}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Venc. 30 dias</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.dueNext30Days}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Novas no período</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.newSubscriptionsInPeriod}</CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Canceladas</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{summary.canceledSubscriptions}</CardContent>
              </Card>
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Pagamentos Asaas</h2>
            <p className="text-sm text-muted-foreground">
              Cobranças registradas na conta Asaas, separadas por tipo de produto.
            </p>
          </div>

          {pageSummary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nesta página
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{pageSummary.count} pagamentos</p>
                  <p className="text-sm text-muted-foreground">{formatMoney(pageSummary.totalValue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Confirmados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-emerald-700">
                    {formatMoney(pageSummary.confirmedValue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Extensão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{pageSummary.byCategory.EXTENSION.count}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(pageSummary.byCategory.EXTENSION.value)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Leads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{pageSummary.byCategory.LEADS.count}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(pageSummary.byCategory.LEADS.value)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader className="space-y-4 pb-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">Extrato de pagamentos</CardTitle>
                  <CardDescription>
                    {payments?.totalCount != null
                      ? `${payments.totalCount} registro(s) no filtro atual`
                      : 'Carregando…'}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-8"
                      placeholder="Buscar descrição ou cliente"
                      value={descriptionSearch}
                      onChange={(e) => setDescriptionSearch(e.target.value)}
                    />
                  </div>
                  <Select
                    value={paymentStatus}
                    onValueChange={(v) => {
                      setPaymentStatus(v);
                      setPaymentOffset(0);
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos status</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="RECEIVED">Recebido</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                      <SelectItem value="OVERDUE">Em atraso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs
                value={paymentCategory}
                onValueChange={(value) => {
                  setPaymentCategory(value as 'all' | AdminPaymentCategory);
                  setPaymentOffset(0);
                }}
              >
                <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-muted/50 p-1">
                  {PAYMENT_CATEGORIES.map((category) => (
                    <TabsTrigger
                      key={category.value}
                      value={category.value}
                      className="gap-1.5 data-[state=active]:bg-white"
                    >
                      {category.icon}
                      {category.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-0 pt-4">
              {paymentsQuery.isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : visiblePayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground/50" />
                  <p className="font-medium text-gray-900">Nenhum pagamento encontrado</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Ajuste o período, a categoria ou o filtro de empresa para ver outros resultados.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Data</TableHead>
                        <TableHead className="w-[110px]">Categoria</TableHead>
                        <TableHead className="min-w-[140px]">Cliente</TableHead>
                        <TableHead className="min-w-[220px]">Descrição</TableHead>
                        <TableHead className="w-[100px] text-right">Valor</TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[90px]">Forma</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visiblePayments.map((payment) => (
                        <TableRow key={payment.id} className="hover:bg-muted/30">
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.paymentDate ?? payment.dueDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn('font-normal', CATEGORY_BADGE_CLASS[payment.category])}
                            >
                              {CATEGORY_LABELS[payment.category]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.empresaNome ? (
                              payment.empresaId ? (
                                <button
                                  type="button"
                                  className="text-left text-sm font-medium text-primary hover:underline"
                                  onClick={() => openClientFinance(payment.empresaId!)}
                                >
                                  {payment.empresaNome}
                                </button>
                              ) : (
                                <span className="text-sm font-medium">{payment.empresaNome}</span>
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-sm">{truncateText(payment.description)}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm">
                                <p className="text-sm">{payment.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatMoney(payment.value)}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(payment.status)}>
                              {formatStatusLabel(payment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatBillingType(payment.billingType)}
                          </TableCell>
                          <TableCell>
                            {payment.invoiceUrl ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={payment.invoiceUrl} target="_blank" rel="noreferrer" title="Abrir fatura">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Página {Math.floor(paymentOffset / limit) + 1}
              {payments?.totalCount != null ? ` · ${payments.totalCount} no total` : ''}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={paymentOffset <= 0}
                onClick={() => setPaymentOffset(Math.max(0, paymentOffset - limit))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(payments?.data.length ?? 0) < limit}
                onClick={() => setPaymentOffset(paymentOffset + limit)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
