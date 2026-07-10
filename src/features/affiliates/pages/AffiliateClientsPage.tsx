import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  FilterX,
  Loader2,
  Search,
  Users,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
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
import type { AffiliateClienteIndicado } from '../types';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { useAffiliateClients } from '../hooks/useAffiliateClients';
import { useAffiliateCode } from '../hooks/useAffiliateCode';
import { AffiliateCadastroStatusBanner } from '../components/AffiliateCadastroStatusBanner';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader, AffiliatePageLoading } from '../components/AffiliatePageLayout';
import {
  formatBillingCycleLabelPt,
  formatClientePlanoLabel,
  formatDatePt,
} from '../utils/formatters';

type PeriodFilter = 'all' | '30d' | '90d' | '365d' | 'year';

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function normalizeBillingCycle(cycle: string | null | undefined): string {
  return String(cycle ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '_');
}

function matchesPeriodFilter(createdAt: string, periodFilter: PeriodFilter): boolean {
  if (periodFilter === 'all') return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  if (periodFilter === 'year') {
    return created.getFullYear() === now.getFullYear();
  }
  const days = periodFilter === '30d' ? 30 : periodFilter === '90d' ? 90 : 365;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return created >= cutoff;
}

function matchesPlanFilter(client: AffiliateClienteIndicado, planFilter: string): boolean {
  if (planFilter === 'all') return true;
  return normalizeBillingCycle(client.billing_cycle) === planFilter;
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'active':
    case 'ativo':
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-100 font-semibold text-emerald-800 hover:bg-emerald-100/80"
        >
          Em dia
        </Badge>
      );
    case 'canceled':
    case 'cancelado':
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-100 font-semibold text-red-800 hover:bg-red-100/80"
        >
          Cancelado
        </Badge>
      );
    case 'trialing':
    case 'teste':
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-100 font-semibold text-blue-800 hover:bg-blue-100/80"
        >
          Testando
        </Badge>
      );
    case 'past_due':
    case 'atrasado':
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-100 font-semibold text-amber-800 hover:bg-amber-100/80"
        >
          Atrasado
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
}

function matchesStatusFilter(client: AffiliateClienteIndicado, statusFilter: string): boolean {
  if (statusFilter === 'all') return true;
  const normalized = (client.status ?? '').toLowerCase();
  if (statusFilter === 'active') return ['active', 'ativo'].includes(normalized);
  if (statusFilter === 'canceled') return ['canceled', 'cancelado'].includes(normalized);
  if (statusFilter === 'trialing') return ['trialing', 'teste'].includes(normalized);
  if (statusFilter === 'past_due') return ['past_due', 'atrasado'].includes(normalized);
  return true;
}

export function AffiliateClientsPage() {
  const { isAffiliate, isLoading: loadingAffiliate, affiliateId } = useIsAffiliateUser();
  const { data: affiliateCode } = useAffiliateCode();
  const { data, isLoading, isError, error } = useAffiliateClients(affiliateId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');

  const planOptions = useMemo(() => {
    const cycles = new Set<string>();
    for (const c of data ?? []) {
      const n = normalizeBillingCycle(c.billing_cycle);
      if (n) cycles.add(n);
    }
    return Array.from(cycles).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    const list = data ?? [];
    const q = searchTerm.trim().toLowerCase();
    return list.filter((client) => {
      const name = (client.empresa_nome ?? '').toLowerCase();
      const matchesSearch = !q || name.includes(q);
      return (
        matchesSearch &&
        matchesStatusFilter(client, statusFilter) &&
        matchesPlanFilter(client, planFilter) &&
        matchesPeriodFilter(client.created_at, periodFilter)
      );
    });
  }, [data, searchTerm, statusFilter, planFilter, periodFilter]);

  const activeClientsCount = useMemo(() => {
    if (!data?.length) return 0;
    return data.filter((c) => ['active', 'ativo'].includes((c.status ?? '').toLowerCase())).length;
  }, [data]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
    setPeriodFilter('all');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    planFilter !== 'all' ||
    periodFilter !== 'all';

  if (loadingAffiliate) {
    return <AffiliatePageLoading message="Carregando seus clientes…" />;
  }

  if (!isAffiliate) {
    return (
      <div className="mx-auto mt-8 max-w-2xl p-4">
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-lg font-semibold text-red-800">Acesso restrito</AlertTitle>
          <AlertDescription className="mt-2 text-red-700">
            Sua conta não está vinculada a um cadastro de afiliado. Para ver seus indicados, participe do programa de
            parcerias ou fale com o suporte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!affiliateId) {
    return (
      <div className="mx-auto mt-8 max-w-2xl p-4">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-lg font-semibold text-amber-800">ID do afiliado indisponível</AlertTitle>
          <AlertDescription className="mt-2 text-amber-800">
            O servidor não devolveu seu identificador interno (
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">codigoAfiliadoId</code>). Faça logout e login
            novamente ou verifique a API <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">GET /afiliados/meu-codigo</code>.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const list = data ?? [];

  return (
    <div className={AFFILIATE_PAGE_CLASS}>
      <AffiliateCadastroStatusBanner
        statusCadastro={affiliateCode?.statusCadastro}
        motivoRejeicao={affiliateCode?.motivoRejeicao}
      />
      <AffiliatePageHeader title="Minhas Indicações" />

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar clientes</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Não foi possível carregar a lista. Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-slate-500">Total de indicações</p>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-slate-900">{list.length}</h2>
                <span className="text-xs text-slate-500">clientes registrados</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-slate-500">Clientes ativos</p>
                <Activity className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-emerald-600">{activeClientsCount}</h2>
                <span className="text-xs text-slate-500">com assinatura ativa</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p>Buscando sua base de clientes…</p>
            </div>
          ) : !list.length ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-900">Nenhum cliente indicado ainda</h3>
              <p className="mb-6 max-w-sm text-slate-500">
                Compartilhe seu link de indicação para começar a trazer clientes e ganhar comissões.
              </p>
              <Button asChild>
                <Link to="/app/afiliados">Ver meu link de indicação</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row">
                <div className="flex w-full flex-1 flex-col gap-3 lg:flex-row lg:flex-wrap">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Buscar por empresa…"
                      className="bg-white pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="active">Em dia</SelectItem>
                        <SelectItem value="trialing">Testando</SelectItem>
                        <SelectItem value="past_due">Atrasados</SelectItem>
                        <SelectItem value="canceled">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[180px]">
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        {planOptions.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>
                            {formatBillingCycleLabelPt(cycle)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-[200px]">
                    <Select
                      value={periodFilter}
                      onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todo o período</SelectItem>
                        <SelectItem value="30d">Últimos 30 dias</SelectItem>
                        <SelectItem value="90d">Últimos 90 dias</SelectItem>
                        <SelectItem value="365d">Últimos 12 meses</SelectItem>
                        <SelectItem value="year">Este ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full shrink-0 text-slate-500 hover:text-slate-900 sm:w-auto"
                    onClick={clearFilters}
                  >
                    <FilterX className="mr-2 h-4 w-4" />
                    Limpar filtros
                  </Button>
                ) : null}
              </div>

              {filteredData.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <Search className="mb-4 h-10 w-10 text-slate-300" />
                  <p className="text-lg font-medium text-slate-900">Nenhum cliente encontrado</p>
                  <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Ajuste os filtros ou limpe a pesquisa para ver todos os resultados.
                  </p>
                  <Button type="button" variant="link" className="mt-2" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-slate-200 hover:bg-transparent">
                        <TableHead className="min-w-[200px] py-4">Empresa / cliente</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Cliente desde</TableHead>
                        <TableHead className="min-w-[120px]">Plano</TableHead>
                        <TableHead className="min-w-[130px]">Último pagamento</TableHead>
                        <TableHead className="min-w-[130px]">Próximo vencimento</TableHead>
                        <TableHead className="min-w-[100px] text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((row) => (
                        <TableRow key={row.id} className="border-slate-200">
                          <TableCell className="py-4 font-medium text-slate-900">
                            {row.empresa_nome?.trim() ? (
                              row.empresa_nome.trim()
                            ) : (
                              <span className="italic text-slate-500">Nome não informado</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(row.status)}</TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600">
                            {formatDatePt(row.created_at)}
                          </TableCell>
                          <TableCell className="text-slate-700">{formatClientePlanoLabel(row)}</TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600">
                            {formatDatePt(row.last_payment_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600">
                            {formatDatePt(row.next_due_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-right font-medium text-slate-900">
                            {formatBRL(row.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
