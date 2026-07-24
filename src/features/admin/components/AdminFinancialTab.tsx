import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronRight,
  CreditCard,
  ExternalLink,
  Info,
  Layers,
  Loader2,
  Package,
  Puzzle,
  Receipt,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminFinancialApi,
  AdminPaymentCategory,
  AdminPaymentItem,
  AdminPaymentStatusSummary,
} from '../api/adminFinancialApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
import { useAdminPrivacy } from '../context/AdminPrivacyContext';

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

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
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

const STATUS_CARD_STYLES: Record<
  AdminPaymentStatusSummary['buckets'][number]['status'],
  {
    value: string;
    bar: string;
    barEmpty: string;
    row: string;
    tip: string;
  }
> = {
  RECEIVED: {
    value: 'text-emerald-600',
    bar: 'bg-emerald-500',
    barEmpty: 'bg-[repeating-linear-gradient(-45deg,#d1fae5,#d1fae5_6px,#ecfdf5_6px,#ecfdf5_12px)]',
    row: 'text-emerald-700',
    tip: 'Cobranças já creditadas na conta (status RECEIVED do Asaas).',
  },
  CONFIRMED: {
    value: 'text-blue-600',
    bar: 'bg-blue-500',
    barEmpty: 'bg-[repeating-linear-gradient(-45deg,#dbeafe,#dbeafe_6px,#eff6ff_6px,#eff6ff_12px)]',
    row: 'text-blue-700',
    tip: 'Cobranças confirmadas, aguardando crédito (status CONFIRMED do Asaas).',
  },
  PENDING: {
    value: 'text-amber-600',
    bar: 'bg-amber-500',
    barEmpty: 'bg-[repeating-linear-gradient(-45deg,#fef3c7,#fef3c7_6px,#fffbeb_6px,#fffbeb_12px)]',
    row: 'text-amber-700',
    tip: 'Cobranças emitidas e ainda sem pagamento (status PENDING do Asaas).',
  },
  OVERDUE: {
    value: 'text-red-600',
    bar: 'bg-red-500',
    barEmpty: 'bg-[repeating-linear-gradient(-45deg,#fecaca,#fecaca_6px,#fef2f2_6px,#fef2f2_12px)]',
    row: 'text-red-700',
    tip: 'Cobranças vencidas e em atraso (status OVERDUE do Asaas).',
  },
};

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Recebidas',
  CONFIRMED: 'Confirmadas',
  PENDING: 'Aguardando pagamento',
  OVERDUE: 'Vencidas',
};

function buildAsaasCustomerUrl(customerId: string, invoiceUrl?: string | null): string {
  const envHint = String(import.meta.env.VITE_ASAAS_ENVIRONMENT ?? '').toLowerCase();
  const fromInvoice = Boolean(invoiceUrl?.includes('sandbox.asaas.com'));
  const isSandbox = envHint === 'sandbox' || fromInvoice || (!envHint && import.meta.env.DEV);
  const host = isSandbox ? 'https://sandbox.asaas.com' : 'https://www.asaas.com';
  return `${host}/customerAccount/show/${encodeURIComponent(customerId)}`;
}

type StatusClientRow = {
  key: string;
  empresaId: string | null;
  empresaNome: string | null;
  customerId: string | null;
  charges: number;
  value: number;
};

function aggregateClientsFromPayments(payments: AdminPaymentItem[]): StatusClientRow[] {
  const map = new Map<string, StatusClientRow>();

  for (const payment of payments) {
    const key = payment.empresaId || payment.customerId || payment.id;
    const existing = map.get(key);
    if (existing) {
      existing.charges += 1;
      existing.value += payment.value;
      if (!existing.empresaNome && payment.empresaNome) {
        existing.empresaNome = payment.empresaNome;
      }
      continue;
    }

    map.set(key, {
      key,
      empresaId: payment.empresaId ?? null,
      empresaNome: payment.empresaNome ?? null,
      customerId: payment.customerId ?? null,
      charges: 1,
      value: payment.value,
    });
  }

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export function AdminFinancialTab() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const empresaFromQuery = searchParams.get('empresaId') ?? '';
  const paymentsSectionRef = useRef<HTMLDivElement>(null);
  const { hidden: privacyHidden, maskMoney, maskCount } = useAdminPrivacy();

  const today = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(today);
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [empresaFilter, setEmpresaFilter] = useState(empresaFromQuery);
  const [paymentCategory, setPaymentCategory] = useState<'all' | AdminPaymentCategory>('all');
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [paymentOffset, setPaymentOffset] = useState(0);
  const [clientsDialogStatus, setClientsDialogStatus] = useState<string | null>(null);
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

  const statusSummaryQuery = useQuery({
    queryKey: ['admin-financial-payment-status-summary', startDate, endDate],
    queryFn: () => adminFinancialApi.getPaymentStatusSummary({ startDate, endDate }),
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

  const clientsDialogQuery = useQuery({
    queryKey: ['admin-financial-status-clients', clientsDialogStatus, startDate, endDate],
    enabled: Boolean(clientsDialogStatus),
    queryFn: async () => {
      const list = await adminFinancialApi.listPayments({
        startDate,
        endDate,
        status: clientsDialogStatus!,
        limit: 1000,
        offset: 0,
      });
      return aggregateClientsFromPayments(list.data);
    },
  });

  const statusSummary = statusSummaryQuery.data;
  const payments = paymentsQuery.data;
  const pageSummary = payments?.pageSummary;

  const statusBarMax = useMemo(() => {
    if (!statusSummary?.buckets.length) return 0;
    return Math.max(...statusSummary.buckets.map((b) => b.value), 0);
  }, [statusSummary]);

  const scrollToPayments = () => {
    window.requestAnimationFrame(() => {
      paymentsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const filterChargesByStatus = (status: string) => {
    setPaymentStatus(status);
    setPaymentCategory('all');
    setEmpresaFilter('');
    setDescriptionSearch('');
    setPaymentOffset(0);
    scrollToPayments();
  };

  const openClientsForStatus = (status: string) => {
    setClientsDialogStatus(status);
  };

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

  const filterPaymentsForClient = (client: StatusClientRow, status: string) => {
    setPaymentStatus(status);
    setPaymentCategory('all');
    setDescriptionSearch('');
    setPaymentOffset(0);
    if (client.empresaId) {
      setEmpresaFilter(client.empresaId);
      navigate(`/app/admin?tab=financeiro&empresaId=${encodeURIComponent(client.empresaId)}`);
    } else {
      setEmpresaFilter('');
      setDescriptionSearch(client.empresaNome || client.customerId || '');
    }
    setClientsDialogStatus(null);
    scrollToPayments();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Período e filtros</CardTitle>
            <CardDescription>
              Pagamentos do grupo Disparo Rápido no Asaas. Filtre por período, cliente e categoria.
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

        <section className="space-y-4">
          {statusSummaryQuery.isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : statusSummary ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {statusSummary.buckets.map((bucket) => {
                const styles = STATUS_CARD_STYLES[bucket.status];
                const fillPct =
                  statusBarMax > 0 ? Math.max(6, Math.round((bucket.value / statusBarMax) * 100)) : 0;
                const isActive = paymentStatus === bucket.status;
                const isEmpty = bucket.value <= 0 && bucket.charges <= 0;

                return (
                  <Card
                    key={bucket.status}
                    className={cn(
                      'overflow-hidden border-slate-200 shadow-sm transition-shadow',
                      isActive && 'ring-2 ring-offset-1 ring-slate-300'
                    )}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-700">{bucket.label}</CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="rounded-full p-0.5 text-slate-400 hover:text-slate-600"
                            aria-label={`Sobre ${bucket.label}`}
                          >
                            <Info className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-xs">{styles.tip}</TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div>
                        <p className={cn('text-2xl font-bold tracking-tight', styles.value)}>
                          {maskMoney(bucket.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {maskMoney(bucket.netValue)} líquido
                        </p>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-sm bg-slate-100">
                        {isEmpty || privacyHidden ? (
                          <div className={cn('h-full w-full', styles.barEmpty)} />
                        ) : (
                          <div
                            className={cn('h-full rounded-sm transition-all', styles.bar)}
                            style={{ width: `${fillPct}%` }}
                          />
                        )}
                      </div>

                      <div className="space-y-0.5 border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          disabled={isEmpty}
                          onClick={() => openClientsForStatus(bucket.status)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm font-medium transition-colors',
                            isEmpty
                              ? 'cursor-not-allowed text-slate-400'
                              : cn('hover:bg-slate-50', styles.row)
                          )}
                        >
                          <Users className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span className="flex-1">
                            {privacyHidden
                              ? '*** clientes'
                              : pluralize(bucket.clients, 'cliente', 'clientes')}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </button>
                        <button
                          type="button"
                          disabled={isEmpty}
                          onClick={() => filterChargesByStatus(bucket.status)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-left text-sm font-medium transition-colors',
                            isEmpty
                              ? 'cursor-not-allowed text-slate-400'
                              : cn('hover:bg-slate-50', styles.row)
                          )}
                        >
                          <Receipt className="h-3.5 w-3.5 shrink-0 opacity-80" />
                          <span className="flex-1">
                            {privacyHidden
                              ? '*** cobranças'
                              : pluralize(bucket.charges, 'cobrança', 'cobranças')}
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : null}

          {pageSummary && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Nesta página
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">
                    {maskCount(pageSummary.count)} pagamentos
                  </p>
                  <p className="text-sm text-muted-foreground">{maskMoney(pageSummary.totalValue)}</p>
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
                    {maskMoney(pageSummary.confirmedValue)}
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
                  <p className="text-xl font-bold">{maskCount(pageSummary.byCategory.EXTENSION.count)}</p>
                  <p className="text-sm text-muted-foreground">
                    {maskMoney(pageSummary.byCategory.EXTENSION.value)}
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
                  <p className="text-xl font-bold">{maskCount(pageSummary.byCategory.LEADS.count)}</p>
                  <p className="text-sm text-muted-foreground">
                    {maskMoney(pageSummary.byCategory.LEADS.value)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card ref={paymentsSectionRef} id="extrato-pagamentos">
            <CardHeader className="space-y-4 pb-0">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">Extrato de pagamentos</CardTitle>
                  <CardDescription>
                    {payments?.totalCount != null
                      ? `${payments.totalCount} registro(s) no filtro atual`
                      : 'Carregando…'}
                    {paymentStatus !== 'all'
                      ? ` · status ${STATUS_LABELS[paymentStatus] ?? paymentStatus}`
                      : ''}
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
                          <TableCell className="text-right font-medium">{maskMoney(payment.value)}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadgeVariant(payment.status)}>
                              {formatStatusLabel(payment.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatBillingType(payment.billingType)}
                          </TableCell>
                          <TableCell>
                            {payment.customerId ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a
                                  href={buildAsaasCustomerUrl(payment.customerId, payment.invoiceUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Abrir cliente no Asaas"
                                >
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

        <Dialog
          open={Boolean(clientsDialogStatus)}
          onOpenChange={(open) => {
            if (!open) setClientsDialogStatus(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Clientes · {STATUS_LABELS[clientsDialogStatus ?? ''] ?? clientsDialogStatus}
              </DialogTitle>
              <DialogDescription>
                Clientes do grupo Disparo Rápido com cobranças nesse status no período selecionado.
              </DialogDescription>
            </DialogHeader>

            {clientsDialogQuery.isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (clientsDialogQuery.data?.length ?? 0) === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum cliente encontrado para este status.
              </p>
            ) : (
              <div className="space-y-1">
                {clientsDialogQuery.data?.map((client) => (
                  <button
                    key={client.key}
                    type="button"
                    onClick={() =>
                      clientsDialogStatus
                        ? filterPaymentsForClient(client, clientsDialogStatus)
                        : undefined
                    }
                    className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                  >
                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {client.empresaNome ||
                          (client.customerId ? `Cliente Asaas ${client.customerId}` : 'Cliente sem nome')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {privacyHidden
                          ? '*** cobranças'
                          : pluralize(client.charges, 'cobrança', 'cobranças')}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {maskMoney(client.value)}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
