import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Upload,
  UserCheck,
  Users,
  Wallet,
  X,
  XCircle,
  Filter,
  FilterX,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Separator } from '@/shared/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/utils/utils';
import {
  adminAffiliatesApi,
  type AdminAfiliadoDetail,
  type AdminAfiliadoListItem,
  type AdminRepasseRow,
} from '@/features/admin/api/adminAffiliatesApi';
import { RepasseStatusHistoricoTimeline } from '@/features/affiliates/utils/repasseStatus';

const REPASSE_STATUS_OPTIONS = [
  'aguardando_nf',
  'nf_enviada',
  'em_analise',
  'aprovado',
  'pago',
  'divergencia',
  'cancelado',
] as const;

const STATUS_LABEL: Record<string, string> = {
  aguardando_nf: 'Aguardando NF',
  nf_enviada: 'NF enviada',
  em_analise: 'Em análise',
  aprovado: 'Aprovado',
  pago: 'Pago',
  divergencia: 'Divergência',
  cancelado: 'Cancelado',
};

const MODO_REPASSE_LABEL: Record<string, string> = {
  MANUAL_NF: 'Manual (NF)',
  SPLIT_ASAAS: 'Split Asaas',
};

const CADASTRO_STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
};

const TIPO_PLANO_OPTIONS = ['ISENTO', 'MENSALIDADE'] as const;

const AREA_ATUACAO_OPTIONS: { value: string; label: string }[] = [
  { value: 'agencia_marketing', label: 'Agência de Marketing' },
  { value: 'autonomo', label: 'Autônomo' },
  { value: 'influenciador', label: 'Influenciador' },
  { value: 'info_produtor', label: 'Info Produtor' },
  { value: 'promotor_vendas', label: 'Promotor de Vendas' },
  { value: 'representante_comercial', label: 'Representante Comercial' },
  { value: 'tik_toker', label: 'Tik Toker' },
  { value: 'youtuber', label: 'Youtuber' },
  { value: 'outros', label: 'Outros' },
];

const AREA_ATUACAO_LABEL: Record<string, string> = Object.fromEntries(
  AREA_ATUACAO_OPTIONS.map((o) => [o.value, o.label])
);

const CHAVE_PIX_TIPO_OPTIONS = ['CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA'] as const;

const INITIAL_AFFILIATE_FILTERS = {
  nome: '',
  cnpj: '',
  id: '',
  data: '',
  cidade: '',
  estado: '',
  telefone: '',
  area_atuacao: 'all',
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function matchesAffiliateFilters(item: AdminAfiliadoListItem, filters: typeof INITIAL_AFFILIATE_FILTERS) {
  const nomeQ = filters.nome.trim().toLowerCase();
  if (nomeQ && !(item.nome ?? item.ref_slug).toLowerCase().includes(nomeQ)) return false;

  const cnpjQ = onlyDigits(filters.cnpj);
  if (cnpjQ && !onlyDigits(item.cnpj ?? '').includes(cnpjQ)) return false;

  const idQ = filters.id.trim().toLowerCase();
  if (idQ && !item.id.toLowerCase().includes(idQ)) return false;

  const dataQ = filters.data.trim();
  if (dataQ && !item.created_at.startsWith(dataQ)) return false;

  const cidadeQ = filters.cidade.trim().toLowerCase();
  if (cidadeQ && !(item.cidade ?? '').toLowerCase().includes(cidadeQ)) return false;

  const estadoQ = filters.estado.trim().toLowerCase();
  if (estadoQ && !(item.estado ?? '').toLowerCase().includes(estadoQ)) return false;

  const telQ = onlyDigits(filters.telefone);
  if (telQ && !onlyDigits(item.telefone ?? '').includes(telQ)) return false;

  if (filters.area_atuacao !== 'all' && item.area_atuacao !== filters.area_atuacao) return false;

  return true;
}

function hasActiveAffiliateFilters(filters: typeof INITIAL_AFFILIATE_FILTERS) {
  return Object.entries(filters).some(([key, value]) =>
    key === 'area_atuacao' ? value !== 'all' : value.trim() !== ''
  );
}

function formatEnderecoLinha(item: {
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
}) {
  const parts = [
    [item.rua, item.numero].filter(Boolean).join(', '),
    item.complemento,
    item.bairro,
    [item.cidade, item.estado].filter(Boolean).join(' / '),
    item.cep ? `CEP ${item.cep}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/** Converte ISO -> valor aceito por <input type="datetime-local"> (hora local). */
function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function cadastroStatusTone(status?: string) {
  switch (status) {
    case 'PENDENTE':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'APROVADO':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'REJEITADO':
      return 'bg-red-50 text-red-800 border-red-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

function CadastroStatusBadge({ status }: { status?: string }) {
  const value = status ?? 'APROVADO';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cadastroStatusTone(value)
      )}
    >
      {CADASTRO_STATUS_LABEL[value] ?? value}
    </span>
  );
}

function formatBrl(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatComissaoPair(mensalCentavos?: number, anualCentavos?: number) {
  const m = mensalCentavos ?? 1000;
  const a = anualCentavos ?? 7500;
  return `${formatBrl(m)} / ${formatBrl(a)}`;
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  if (/[",\n\r;]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function formatCentavosCsv(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || !Number.isFinite(cents)) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

function buildAfiliadosCsv(items: AdminAfiliadoListItem[]): string {
  const headers = [
    'Nome',
    'E-mail',
    'CNPJ',
    'Telefone',
    'Ref',
    'Área de atuação',
    'Razão social',
    'CEP',
    'Rua',
    'Número',
    'Complemento',
    'Bairro',
    'Cidade',
    'Estado',
    'Modo de repasse',
    'Comissão mensal (R$)',
    'Comissão anual (R$)',
    'Plano',
    'Status cadastro',
    'Status assinatura',
    'Criado em',
    'Atualizado em',
    'ID',
  ];

  const lines = items.map((a) =>
    [
      a.nome ?? '',
      a.email ?? '',
      a.cnpj ?? '',
      a.telefone ?? '',
      a.ref_slug ?? '',
      a.area_atuacao ? AREA_ATUACAO_LABEL[a.area_atuacao] ?? a.area_atuacao : '',
      a.razao_social ?? '',
      a.cep ?? '',
      a.rua ?? '',
      a.numero ?? '',
      a.complemento ?? '',
      a.bairro ?? '',
      a.cidade ?? '',
      a.estado ?? '',
      MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse,
      formatCentavosCsv(a.comissao_mensal_centavos),
      formatCentavosCsv(a.comissao_anual_centavos),
      a.tipo_plano ?? '',
      a.status_cadastro ? CADASTRO_STATUS_LABEL[a.status_cadastro] ?? a.status_cadastro : '',
      a.status_assinatura ?? '',
      a.created_at ? formatDate(a.created_at) : '',
      a.updated_at ? formatDate(a.updated_at) : '',
      a.id,
    ]
      .map(escapeCsvCell)
      .join(';')
  );

  return `\uFEFF${[headers.map(escapeCsvCell).join(';'), ...lines].join('\r\n')}`;
}

function downloadAfiliadosCsv(items: AdminAfiliadoListItem[]) {
  const csv = buildAfiliadosCsv(items);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `afiliados_${stamp}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

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

function RepasseStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        repasseStatusTone(status)
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function RepasseStatusIcon({ status }: { status: string }) {
  if (status === 'pago') return <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />;
  if (status === 'divergencia' || status === 'cancelado') {
    return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
  }
  return <Clock className="h-4 w-4 text-amber-500 shrink-0" />;
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      )}
    </div>
  );
}

export function AdminAffiliatesTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedAfiliadoId, setSelectedAfiliadoId] = useState<string | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [nfLoadingId, setNfLoadingId] = useState<string | null>(null);
  const [pixLoadingId, setPixLoadingId] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState({ ...INITIAL_AFFILIATE_FILTERS });
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [cadastroFilter, setCadastroFilter] = useState<'all' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('PENDENTE');
  const [mainTab, setMainTab] = useState('afiliados');

  const pendentesQuery = useQuery({
    queryKey: ['admin', 'afiliados', 'repasses-pendentes'],
    queryFn: () => adminAffiliatesApi.listRepassesPendentes(),
  });

  const afiliadosQuery = useQuery({
    queryKey: ['admin', 'afiliados', 'list', cadastroFilter],
    queryFn: () =>
      adminAffiliatesApi.listAfiliados({
        limit: 100,
        ...(cadastroFilter !== 'all' ? { status_cadastro: cadastroFilter } : {}),
      }),
  });

  const detailQuery = useQuery({
    queryKey: ['admin', 'afiliados', 'detail', selectedAfiliadoId],
    queryFn: () => adminAffiliatesApi.getAfiliado(selectedAfiliadoId!),
    enabled: Boolean(selectedAfiliadoId),
  });

  const openAfiliadoDetail = (afiliadoId: string) => {
    setSelectedAfiliadoId(afiliadoId);
    setDetailSheetOpen(true);
  };

  const handleDetailSheetOpenChange = (open: boolean) => {
    setDetailSheetOpen(open);
  };

  const nomeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of afiliadosQuery.data?.items ?? []) {
      map.set(a.id, a.nome ?? a.ref_slug);
    }
    if (detailQuery.data?.afiliado) {
      const d = detailQuery.data.afiliado;
      map.set(d.id, d.nome ?? d.ref_slug);
    }
    return map;
  }, [afiliadosQuery.data, detailQuery.data]);

  const filteredAfiliados = useMemo(() => {
    const items = afiliadosQuery.data?.items ?? [];
    if (!hasActiveAffiliateFilters(searchFilters)) return items;
    return items.filter((a) => matchesAffiliateFilters(a, searchFilters));
  }, [afiliadosQuery.data, searchFilters]);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(searchFilters).filter(([key, value]) =>
      key === 'area_atuacao' ? value !== 'all' : value.trim() !== ''
    ).length;
  }, [searchFilters]);

  const patchMutation = useMutation({
    mutationFn: (vars: { afiliadoId: string; repasseId: string; status: string; admin_observacao?: string }) =>
      adminAffiliatesApi.patchRepasse(vars.afiliadoId, vars.repasseId, {
        status: vars.status,
        admin_observacao: vars.admin_observacao?.trim() ? vars.admin_observacao.trim() : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
      toast({ title: 'Repasse atualizado', description: 'Status salvo com sucesso.' });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erro ao salvar',
        description: e instanceof Error ? e.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const cadastroMutation = useMutation({
    mutationFn: (vars: {
      afiliadoId: string;
      action: 'aprovar' | 'rejeitar' | 'revogar_rejeicao';
      motivo?: string;
      permite_correcao_cadastro?: boolean;
    }) =>
      adminAffiliatesApi.patchCadastro(vars.afiliadoId, {
        action: vars.action,
        motivo: vars.motivo,
        permite_correcao_cadastro: vars.permite_correcao_cadastro,
      }),
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
      const title =
        vars.action === 'aprovar'
          ? 'Cadastro aprovado'
          : vars.action === 'revogar_rejeicao'
            ? 'Rejeição revogada'
            : 'Cadastro rejeitado';
      const description =
        vars.action === 'aprovar'
          ? 'O afiliado já pode usar o link de indicação.'
          : vars.action === 'revogar_rejeicao'
            ? 'O cadastro voltou para análise pendente.'
            : 'O afiliado foi notificado no painel.';
      toast({ title, description });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erro ao atualizar cadastro',
        description: e instanceof Error ? e.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const editAfiliadoMutation = useMutation({
    mutationFn: (vars: { afiliadoId: string; body: Parameters<typeof adminAffiliatesApi.patchAfiliado>[1] }) =>
      adminAffiliatesApi.patchAfiliado(vars.afiliadoId, vars.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
      toast({ title: 'Dados atualizados', description: 'As informações do afiliado foram salvas.' });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erro ao salvar',
        description: e instanceof Error ? e.message : 'Não foi possível salvar as alterações.',
        variant: 'destructive',
      });
    },
  });

  const uploadPixMutation = useMutation({
    mutationFn: (vars: { afiliadoId: string; repasseId: string; file: File; marcar_pago: boolean }) =>
      adminAffiliatesApi.uploadRepasseComprovantePix({
        afiliadoId: vars.afiliadoId,
        repasseId: vars.repasseId,
        file: vars.file,
        marcar_pago: vars.marcar_pago,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
      toast({
        title: 'Pagamento concluído',
        description: 'Comprovante PIX enviado e repasse marcado como pago.',
      });
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erro no envio',
        description: e instanceof Error ? e.message : 'Não foi possível enviar o comprovante.',
        variant: 'destructive',
      });
    },
  });

  const openNf = async (afiliadoId: string, repasseId: string) => {
    setNfLoadingId(repasseId);
    try {
      const { signedUrl } = await adminAffiliatesApi.getRepasseNfSignedUrl(afiliadoId, repasseId);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (e: unknown) {
      toast({
        title: 'NF indisponível',
        description: e instanceof Error ? e.message : 'Não foi possível abrir a nota fiscal.',
        variant: 'destructive',
      });
    } finally {
      setNfLoadingId(null);
    }
  };

  const openPix = async (afiliadoId: string, repasseId: string) => {
    setPixLoadingId(repasseId);
    try {
      const { signedUrl } = await adminAffiliatesApi.getRepasseComprovantePixSignedUrl(afiliadoId, repasseId);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (e: unknown) {
      toast({
        title: 'Comprovante indisponível',
        description: e instanceof Error ? e.message : 'Não foi possível abrir o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setPixLoadingId(null);
    }
  };

  const openAfiliadoFromHistorico = (afiliadoId: string) => {
    openAfiliadoDetail(afiliadoId);
    setMainTab('afiliados');
  };

  const pendentesCount = pendentesQuery.data?.length ?? 0;
  const pendentesCadastroCount = afiliadosQuery.data?.pendentes_cadastro ?? 0;
  const afiliadosCount = afiliadosQuery.data?.total ?? afiliadosQuery.data?.items.length ?? 0;
  const isRefreshing = afiliadosQuery.isFetching || pendentesQuery.isFetching;

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
  };

  const handleExportPlanilha = () => {
    if (filteredAfiliados.length === 0) {
      toast({
        title: 'Nada para exportar',
        description: 'Não há afiliados na lista atual.',
        variant: 'destructive',
      });
      return;
    }
    downloadAfiliadosCsv(filteredAfiliados);
    toast({
      title: 'Planilha gerada',
      description: `${filteredAfiliados.length} afiliado${filteredAfiliados.length === 1 ? '' : 's'} exportado${filteredAfiliados.length === 1 ? '' : 's'} em CSV.`,
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryMetric
          label="Afiliados cadastrados"
          value={afiliadosCount}
          icon={Users}
          loading={afiliadosQuery.isLoading}
        />
        <SummaryMetric
          label="Cadastros pendentes"
          value={pendentesCadastroCount}
          icon={Clock}
          loading={afiliadosQuery.isLoading}
        />
        <SummaryMetric
          label="Repasses na fila"
          value={pendentesCount}
          icon={Wallet}
          loading={pendentesQuery.isLoading}
        />
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="afiliados">Afiliados</TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            Solicitações
            {pendentesCount > 0 ? (
              <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-xs">
                {pendentesCount}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="afiliados" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Afiliados</CardTitle>
                  <CardDescription>Clique em uma linha para abrir detalhes e gerenciar repasses.</CardDescription>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Select
                    value={cadastroFilter}
                    onValueChange={(v) => setCadastroFilter(v as typeof cadastroFilter)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status cadastro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendentes</SelectItem>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="APROVADO">Aprovados</SelectItem>
                      <SelectItem value="REJEITADO">Rejeitados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={handleExportPlanilha}
                    disabled={afiliadosQuery.isLoading || filteredAfiliados.length === 0}
                    title="Exportar planilha CSV"
                  >
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => void handleRefresh()}
                    disabled={isRefreshing}
                    title="Atualizar"
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Atualizar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {activeFiltersCount > 0 ? (
                      <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-xs">
                        {activeFiltersCount}
                      </Badge>
                    ) : null}
                  </Button>
                </div>
              </div>
              <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                <CollapsibleContent>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-700">Buscar afiliado</p>
                      {hasActiveAffiliateFilters(searchFilters) ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-muted-foreground"
                          onClick={() => setSearchFilters({ ...INITIAL_AFFILIATE_FILTERS })}
                        >
                          <FilterX className="h-3.5 w-3.5" />
                          Limpar filtros
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-nome">Nome</Label>
                        <Input
                          id="filter-nome"
                          placeholder="Nome ou ref"
                          value={searchFilters.nome}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, nome: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-cnpj">CNPJ</Label>
                        <Input
                          id="filter-cnpj"
                          placeholder="00.000.000/0000-00"
                          value={searchFilters.cnpj}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, cnpj: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-id">ID</Label>
                        <Input
                          id="filter-id"
                          placeholder="UUID do afiliado"
                          value={searchFilters.id}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, id: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-data">Data de cadastro</Label>
                        <Input
                          id="filter-data"
                          type="date"
                          value={searchFilters.data}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, data: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-cidade">Cidade</Label>
                        <Input
                          id="filter-cidade"
                          placeholder="Cidade"
                          value={searchFilters.cidade}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, cidade: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-estado">Estado (UF)</Label>
                        <Input
                          id="filter-estado"
                          placeholder="SP"
                          maxLength={2}
                          value={searchFilters.estado}
                          onChange={(e) =>
                            setSearchFilters((f) => ({ ...f, estado: e.target.value.toUpperCase() }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-telefone">Telefone</Label>
                        <Input
                          id="filter-telefone"
                          placeholder="(11) 99999-9999"
                          value={searchFilters.telefone}
                          onChange={(e) => setSearchFilters((f) => ({ ...f, telefone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="filter-area">Área de atuação</Label>
                        <Select
                          value={searchFilters.area_atuacao}
                          onValueChange={(v) => setSearchFilters((f) => ({ ...f, area_atuacao: v }))}
                        >
                          <SelectTrigger id="filter-area">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {AREA_ATUACAO_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardHeader>
            <CardContent>
              <AfiliadosTable
                loading={afiliadosQuery.isLoading}
                error={afiliadosQuery.isError}
                items={filteredAfiliados}
                selectedId={selectedAfiliadoId}
                onSelect={openAfiliadoDetail}
                emptyMessage={
                  hasActiveAffiliateFilters(searchFilters)
                    ? 'Nenhum afiliado encontrado para os filtros aplicados.'
                    : 'Nenhum afiliado cadastrado.'
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-4 space-y-4">
          <Card>
            <CardContent className="pt-6">
              {pendentesQuery.isLoading ? (
                <LoadingBlock />
              ) : pendentesQuery.isError ? (
                <ErrorBlock message="Erro ao carregar histórico." />
              ) : pendentesCount === 0 ? (
                <EmptyBlock message="Nenhum repasse pendente no momento." icon={CheckCircle} />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Afiliado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendentesQuery.data!.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono text-sm">{r.periodo_referencia}</TableCell>
                          <TableCell className="font-medium">{formatBrl(r.valor_calculado_centavos)}</TableCell>
                          <TableCell>
                            <RepasseStatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {r.afiliado_nome ||
                                nomeById.get(r.afiliado_id) ||
                                r.afiliado_ref_slug ||
                                '—'}
                            </span>
                            {r.afiliado_ref_slug ? (
                              <span className="mt-0.5 block font-mono text-xs text-muted-foreground truncate max-w-[160px]">
                                {r.afiliado_ref_slug}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openNf(r.afiliado_id, r.id)}
                                disabled={nfLoadingId === r.id || pixLoadingId === r.id}
                              >
                                {nfLoadingId === r.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                <span className="ml-1.5">NF</span>
                              </Button>
                              {r.comprovante_pix_object_key ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPix(r.afiliado_id, r.id)}
                                  disabled={nfLoadingId === r.id || pixLoadingId === r.id}
                                >
                                  {pixLoadingId === r.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ExternalLink className="h-3 w-3" />
                                  )}
                                  <span className="ml-1.5">PIX</span>
                                </Button>
                              ) : null}
                              <Button size="sm" onClick={() => openAfiliadoFromHistorico(r.afiliado_id)}>
                                Gerenciar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={detailSheetOpen} onOpenChange={handleDetailSheetOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="text-left pr-8">
            <SheetTitle>Detalhe do afiliado</SheetTitle>
            <SheetDescription>
              {detailQuery.data?.afiliado ? (
                <span className="font-medium text-foreground">
                  {detailQuery.data.afiliado.nome ?? detailQuery.data.afiliado.ref_slug}
                </span>
              ) : (
                'Carregando…'
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {detailQuery.isLoading || (selectedAfiliadoId && !detailQuery.data && !detailQuery.isError) ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detailQuery.isError ? (
              <ErrorBlock message="Não foi possível carregar o afiliado." />
            ) : detailQuery.data ? (
              <AdminAfiliadoDetailView
                detail={detailQuery.data}
                onOpenNf={openNf}
                onOpenPix={openPix}
                nfLoadingId={nfLoadingId}
                pixLoadingId={pixLoadingId}
                onPatch={(repasseId, status, obs) =>
                  patchMutation.mutate({
                    afiliadoId: selectedAfiliadoId!,
                    repasseId,
                    status,
                    admin_observacao: obs,
                  })
                }
                patchPending={patchMutation.isPending}
                onApproveCadastro={() =>
                  cadastroMutation.mutate({ afiliadoId: selectedAfiliadoId!, action: 'aprovar' })
                }
                onRejectCadastro={(motivo, permiteCorrecaoCadastro) =>
                  cadastroMutation.mutate({
                    afiliadoId: selectedAfiliadoId!,
                    action: 'rejeitar',
                    motivo,
                    permite_correcao_cadastro: permiteCorrecaoCadastro,
                  })
                }
                onRevokeRejection={() =>
                  cadastroMutation.mutate({
                    afiliadoId: selectedAfiliadoId!,
                    action: 'revogar_rejeicao',
                  })
                }
                cadastroPending={cadastroMutation.isPending}
                onSaveCadastro={async (body) => {
                  await editAfiliadoMutation.mutateAsync({ afiliadoId: selectedAfiliadoId!, body });
                }}
                savePending={editAfiliadoMutation.isPending}
                onUploadComprovantePix={async (repasseId, file) => {
                  await uploadPixMutation.mutateAsync({
                    afiliadoId: selectedAfiliadoId!,
                    repasseId,
                    file,
                    marcar_pago: true,
                  });
                }}
                uploadPixPending={uploadPixMutation.isPending}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex items-center gap-2 py-8 text-muted-foreground justify-center">
      <Loader2 className="h-4 w-4 animate-spin" />
      Carregando…
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function EmptyBlock({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <Icon className="h-10 w-10 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
  actions,
  className,
}: {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('overflow-hidden rounded-lg border border-slate-200 bg-white', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
          {title}
        </h4>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function InfoField({
  icon: Icon,
  label,
  value,
  mono,
  onCopy,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string | null;
  mono?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <div className="flex items-start gap-1.5">
        <p
          className={cn(
            'min-w-0 flex-1 break-words text-slate-900',
            mono ? 'font-mono text-xs' : 'text-sm'
          )}
        >
          {value || '—'}
        </p>
        {onCopy && value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 text-muted-foreground"
            onClick={onCopy}
            title="Copiar"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function AfiliadosTable({
  loading,
  error,
  items,
  selectedId,
  onSelect,
  emptyMessage,
}: {
  loading: boolean;
  error: boolean;
  items: AdminAfiliadoListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage: string;
}) {
  if (loading) return <LoadingBlock />;
  if (error) return <ErrorBlock message="Erro ao carregar afiliados." />;
  if (items.length === 0) return <EmptyBlock message={emptyMessage} icon={Users} />;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Afiliado</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Cidade/UF</TableHead>
            <TableHead>Repasse</TableHead>
            <TableHead>Comissão</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow
              key={a.id}
              className={cn('cursor-pointer', selectedId === a.id && 'bg-primary/5')}
              onClick={() => onSelect(a.id)}
            >
              <TableCell>
                <span className="block font-medium">{a.nome ?? a.ref_slug}</span>
                <span className="mt-0.5 block font-mono text-xs text-muted-foreground truncate max-w-[160px]">
                  {a.id}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{a.cnpj || '—'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{a.telefone || '—'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {a.cidade || a.estado ? [a.cidade, a.estado].filter(Boolean).join(' / ') : '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatComissaoPair(a.comissao_mensal_centavos, a.comissao_anual_centavos)}
              </TableCell>
              <TableCell>{a.tipo_plano}</TableCell>
              <TableCell>
                <CadastroStatusBadge status={a.status_cadastro} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{formatDate(a.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AdminAfiliadoDetailView({
  detail,
  onOpenNf,
  onOpenPix,
  nfLoadingId,
  pixLoadingId,
  onPatch,
  patchPending,
  onApproveCadastro,
  onRejectCadastro,
  onRevokeRejection,
  cadastroPending,
  onSaveCadastro,
  savePending,
  onUploadComprovantePix,
  uploadPixPending,
}: {
  detail: AdminAfiliadoDetail;
  onOpenNf: (afiliadoId: string, repasseId: string) => void;
  onOpenPix: (afiliadoId: string, repasseId: string) => void;
  nfLoadingId: string | null;
  pixLoadingId: string | null;
  onPatch: (repasseId: string, status: string, obs?: string) => void;
  patchPending: boolean;
  onApproveCadastro: () => void;
  onRejectCadastro: (motivo?: string, permiteCorrecaoCadastro?: boolean) => void;
  onRevokeRejection: () => void;
  cadastroPending: boolean;
  onSaveCadastro: (body: Parameters<typeof adminAffiliatesApi.patchAfiliado>[1]) => Promise<void>;
  savePending: boolean;
  onUploadComprovantePix: (repasseId: string, file: File) => Promise<void>;
  uploadPixPending: boolean;
}) {
  const { toast } = useToast();
  const a = detail.afiliado;
  const [isEditing, setIsEditing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectMotivo, setRejectMotivo] = useState('');
  const [permiteCorrecaoCadastro, setPermiteCorrecaoCadastro] = useState(true);
  const [edits, setEdits] = useState<Record<string, { status: string; obs: string }>>({});
  const [pixDraft, setPixDraft] = useState<Record<string, File | null>>({});
  const [expandedRepasse, setExpandedRepasse] = useState<string | null>(
    detail.repasses[0]?.id ?? null
  );
  const [form, setForm] = useState({
    comissao_mensal_reais: '',
    comissao_anual_reais: '',
    tipo_plano: '',
    area_atuacao: '',
    chave_pix: '',
    chave_pix_tipo: '',
    created_at: '',
  });

  useEffect(() => {
    setIsEditing(false);
    setIsRejecting(false);
    setRejectMotivo('');
    setPermiteCorrecaoCadastro(true);
  }, [a.id, a.status_cadastro]);

  const startEditing = () => {
    setForm({
      comissao_mensal_reais: ((a.comissao_mensal_centavos ?? 1000) / 100).toFixed(2),
      comissao_anual_reais: ((a.comissao_anual_centavos ?? 7500) / 100).toFixed(2),
      tipo_plano: a.tipo_plano ?? '',
      area_atuacao: a.area_atuacao ?? '',
      chave_pix: a.chave_pix ?? '',
      chave_pix_tipo: a.chave_pix_tipo ?? '',
      created_at: toDatetimeLocal(a.created_at),
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const body: Parameters<typeof adminAffiliatesApi.patchAfiliado>[1] = {};
    const mensal = Number(form.comissao_mensal_reais);
    const anual = Number(form.comissao_anual_reais);
    if (Number.isFinite(mensal) && mensal >= 0) {
      body.comissao_mensal_centavos = Math.round(mensal * 100);
    }
    if (Number.isFinite(anual) && anual >= 0) {
      body.comissao_anual_centavos = Math.round(anual * 100);
    }
    if (form.tipo_plano) body.tipo_plano = form.tipo_plano;
    body.area_atuacao = form.area_atuacao || null;
    body.chave_pix = form.chave_pix.trim() || null;
    body.chave_pix_tipo = form.chave_pix_tipo || null;
    if (form.created_at) body.created_at = new Date(form.created_at).toISOString();
    try {
      await onSaveCadastro(body);
      setIsEditing(false);
    } catch {
      /* toast tratado na mutation */
    }
  };

  const getEdit = (id: string, row: AdminRepasseRow) =>
    edits[id] ?? { status: row.status, obs: row.admin_observacao ?? '' };

  const copyText = async (text: string | null | undefined, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} copiado` });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const pendingRepasses = detail.repasses.filter((r) =>
    ['nf_enviada', 'em_analise', 'aprovado', 'aguardando_nf'].includes(r.status)
  );
  const clientes = detail.clientes as Array<{
    id?: string;
    status?: string;
    value?: number;
    created_at?: string;
    empresas?: { nome?: string } | { nome?: string }[] | null;
  }>;

  return (
    <div className="space-y-4 text-sm">
      {/* Cabeçalho + moderação */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CadastroStatusBadge status={a.status_cadastro} />
              <Badge variant="secondary">{MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse}</Badge>
              <Badge variant="outline">{a.tipo_plano}</Badge>
            </div>
            <p className="truncate text-base font-semibold text-slate-900">
              {a.nome ?? a.ref_slug}
            </p>
            <p className="truncate text-xs text-muted-foreground">{a.email || a.ref_slug}</p>
          </div>
          {!isEditing && !isRejecting ? (
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          ) : null}
        </div>

        {a.status_cadastro === 'PENDENTE' && !isRejecting ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Button type="button" size="sm" disabled={cadastroPending} onClick={onApproveCadastro}>
              {cadastroPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-1 h-4 w-4" />
              )}
              Aprovar cadastro
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              disabled={cadastroPending}
              onClick={() => {
                setRejectMotivo('');
                setPermiteCorrecaoCadastro(true);
                setIsRejecting(true);
              }}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Rejeitar
            </Button>
          </div>
        ) : null}

        {isRejecting ? (
          <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50/70 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">Rejeitar cadastro de afiliado</span>
            </div>
            <p className="text-xs text-red-700/90">
              O afiliado verá o status e o motivo no painel. Marque abaixo se ele poderá corrigir os dados e
              reenviar a solicitação.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="reject-motivo">Motivo da rejeição</Label>
              <Textarea
                id="reject-motivo"
                placeholder="Ex.: dados cadastrais inválidos, documentação pendente…"
                value={rejectMotivo}
                onChange={(e) => setRejectMotivo(e.target.value)}
                rows={3}
                className="bg-white"
              />
            </div>
            <div className="flex items-start gap-2 rounded-md border border-red-100 bg-white/80 p-3">
              <Checkbox
                id="permite-correcao"
                checked={permiteCorrecaoCadastro}
                onCheckedChange={(checked) => setPermiteCorrecaoCadastro(checked === true)}
              />
              <div className="space-y-1">
                <Label htmlFor="permite-correcao" className="text-sm font-medium leading-none">
                  Permitir que o afiliado corrija e reenvie
                </Label>
                <p className="text-xs text-muted-foreground">
                  Quando marcado, o afiliado poderá editar o cadastro e reenviar para nova análise.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={cadastroPending}
                onClick={() => {
                  setIsRejecting(false);
                  setRejectMotivo('');
                  setPermiteCorrecaoCadastro(true);
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={cadastroPending}
                onClick={() =>
                  onRejectCadastro(rejectMotivo.trim() || undefined, permiteCorrecaoCadastro)
                }
              >
                {cadastroPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-4 w-4" />
                )}
                Confirmar rejeição
              </Button>
            </div>
          </div>
        ) : null}

        {a.status_cadastro === 'REJEITADO' && !isRejecting ? (
          <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Cadastro rejeitado</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-200 text-amber-900 hover:bg-amber-50"
                disabled={cadastroPending}
                onClick={onRevokeRejection}
              >
                {cadastroPending ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="mr-1 h-4 w-4" />
                )}
                Revogar rejeição
              </Button>
            </div>
            {a.motivo_rejeicao ? (
              <p className="text-sm text-red-800">
                <span className="font-medium">Motivo:</span> {a.motivo_rejeicao}
              </p>
            ) : (
              <p className="text-sm text-red-700/80">Nenhum motivo registrado.</p>
            )}
            {a.permite_correcao_cadastro === false ? (
              <p className="text-xs text-red-700/90">
                O afiliado não pode corrigir e reenviar pelo painel — apenas revogação manual pelo admin.
              </p>
            ) : (
              <p className="text-xs text-red-700/90">
                O afiliado pode corrigir os dados e reenviar a solicitação pelo painel.
              </p>
            )}
            <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-xs text-red-700/90">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                Rejeitado em {a.cadastro_aprovado_em ? formatDate(a.cadastro_aprovado_em) : '—'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                Por {a.cadastro_moderado_por_nome ?? '—'}
              </span>
            </div>
          </div>
        ) : null}

        {a.status_cadastro === 'APROVADO' && (a.cadastro_aprovado_em || a.cadastro_moderado_por_nome) ? (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-emerald-700">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              Aprovado em {a.cadastro_aprovado_em ? formatDate(a.cadastro_aprovado_em) : '—'}
            </span>
            {a.cadastro_moderado_por_nome ? (
              <span className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" />
                Por {a.cadastro_moderado_por_nome}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEditing ? (
        <DetailSection title="Editar dados cadastrais" icon={Pencil}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-comissao-mensal">Comissão plano mensal (R$)</Label>
              <Input
                id="edit-comissao-mensal"
                type="number"
                min={0}
                step={0.01}
                value={form.comissao_mensal_reais}
                onChange={(e) => setForm((f) => ({ ...f, comissao_mensal_reais: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Por pagamento recorrente no plano mensal.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-comissao-anual">Comissão plano anual (R$)</Label>
              <Input
                id="edit-comissao-anual"
                type="number"
                min={0}
                step={0.01}
                value={form.comissao_anual_reais}
                onChange={(e) => setForm((f) => ({ ...f, comissao_anual_reais: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Por pagamento no plano anual (inclui renovações).</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-plano">Plano</Label>
              <Select value={form.tipo_plano} onValueChange={(v) => setForm((f) => ({ ...f, tipo_plano: v }))}>
                <SelectTrigger id="edit-plano">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPO_PLANO_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-area">Área de atuação</Label>
              <Select value={form.area_atuacao} onValueChange={(v) => setForm((f) => ({ ...f, area_atuacao: v }))}>
                <SelectTrigger id="edit-area">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_ATUACAO_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-pix-tipo">Tipo da chave PIX</Label>
              <Select
                value={form.chave_pix_tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, chave_pix_tipo: v }))}
              >
                <SelectTrigger id="edit-pix-tipo">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CHAVE_PIX_TIPO_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-pix">Chave PIX</Label>
              <Input
                id="edit-pix"
                value={form.chave_pix}
                placeholder="Chave PIX"
                onChange={(e) => setForm((f) => ({ ...f, chave_pix: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="edit-created">Data de cadastro</Label>
              <Input
                id="edit-created"
                type="datetime-local"
                value={form.created_at}
                onChange={(e) => setForm((f) => ({ ...f, created_at: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Altere apenas se precisar corrigir ou retroagir (backdate) o registro.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={savePending} onClick={() => void handleSave()}>
              {savePending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1.5 h-4 w-4" />
              )}
              Salvar alterações
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={savePending}
              onClick={() => setIsEditing(false)}
            >
              <X className="mr-1.5 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </DetailSection>
      ) : (
        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
            <TabsTrigger value="dados" className="text-xs sm:text-sm">
              Dados
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="text-xs sm:text-sm">
              Comissão / PIX
            </TabsTrigger>
            <TabsTrigger value="repasses" className="gap-1.5 text-xs sm:text-sm">
              Repasses
              {pendingRepasses.length > 0 ? (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  {pendingRepasses.length}
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">({detail.repasses.length})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="clientes" className="text-xs sm:text-sm">
              Clientes ({clientes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4 space-y-4">
            <DetailSection title="Identificação" icon={Users}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={Hash} label="ID" value={a.id} mono onCopy={() => void copyText(a.id, 'ID')} />
                <InfoField label="Ref (?ref=)" value={a.ref_slug} mono />
                <InfoField
                  icon={Building2}
                  label="CNPJ"
                  value={a.cnpj}
                  onCopy={a.cnpj ? () => void copyText(a.cnpj, 'CNPJ') : undefined}
                />
                <InfoField label="Razão social" value={a.razao_social} />
                <InfoField
                  icon={Mail}
                  label="E-mail"
                  value={a.email}
                  onCopy={a.email ? () => void copyText(a.email, 'E-mail') : undefined}
                />
                <InfoField
                  icon={Phone}
                  label="Telefone / WhatsApp"
                  value={a.telefone}
                  onCopy={a.telefone ? () => void copyText(a.telefone, 'Telefone') : undefined}
                />
                <InfoField
                  label="Área de atuação"
                  value={a.area_atuacao ? AREA_ATUACAO_LABEL[a.area_atuacao] ?? a.area_atuacao : null}
                />
                <InfoField label="Status assinatura" value={a.status_assinatura} />
                <InfoField
                  icon={CalendarClock}
                  label="Criado em"
                  value={a.created_at ? formatDate(a.created_at) : null}
                />
                <InfoField
                  icon={CalendarClock}
                  label="Atualizado em"
                  value={a.updated_at ? formatDate(a.updated_at) : null}
                />
              </div>
            </DetailSection>

            <DetailSection title="Endereço do checkout" icon={MapPin}>
              {formatEnderecoLinha(a) ? (
                <p className="mb-4 break-words text-sm text-slate-900">{formatEnderecoLinha(a)}</p>
              ) : (
                <p className="mb-4 text-sm italic text-muted-foreground">
                  Endereço não informado no cadastro.
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField label="CEP" value={a.cep} mono />
                <InfoField label="Rua" value={a.rua} />
                <InfoField label="Número" value={a.numero} />
                <InfoField label="Complemento" value={a.complemento} />
                <InfoField label="Bairro" value={a.bairro} />
                <InfoField label="Cidade" value={a.cidade} />
                <InfoField label="Estado (UF)" value={a.estado} />
              </div>
            </DetailSection>
          </TabsContent>

          <TabsContent value="financeiro" className="mt-4 space-y-4">
            <DetailSection title="Comissão e plano" icon={Wallet}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField
                  label="Modo de repasse"
                  value={MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse}
                />
                <InfoField label="Plano" value={a.tipo_plano} />
                <InfoField
                  label="Comissão mensal"
                  value={formatBrl(a.comissao_mensal_centavos ?? 1000)}
                />
                <InfoField
                  label="Comissão anual"
                  value={formatBrl(a.comissao_anual_centavos ?? 7500)}
                />
                <InfoField
                  label="Split percentual"
                  value={`${a.split_percentual}%`}
                />
                <InfoField
                  label="Wallet Asaas"
                  value={a.asaas_wallet_id}
                  mono
                  onCopy={
                    a.asaas_wallet_id ? () => void copyText(a.asaas_wallet_id, 'Wallet Asaas') : undefined
                  }
                />
              </div>
            </DetailSection>

            <DetailSection title="Chave PIX ativa" icon={Hash}>
              {a.chave_pix ? (
                <div className="space-y-2">
                  {a.chave_pix_tipo ? (
                    <Badge variant="outline" className="text-[11px] uppercase">
                      {a.chave_pix_tipo}
                    </Badge>
                  ) : null}
                  <div className="flex gap-2">
                    <p className="flex-1 break-all rounded-md border bg-slate-50 p-2.5 font-mono text-xs">
                      {a.chave_pix}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => void copyText(a.chave_pix, 'Chave PIX')}
                      title="Copiar"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="italic text-muted-foreground">Não informada pelo afiliado</p>
              )}
            </DetailSection>

            {detail.chaves_pix.length > 0 ? (
              <DetailSection title="Histórico de chaves PIX" icon={Clock}>
                <ul className="space-y-2">
                  {detail.chaves_pix.map((key) => (
                    <li
                      key={key.id}
                      className="rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {key.ativa ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Anterior</Badge>
                          )}
                          {key.chave_pix_tipo ? (
                            <span className="text-[11px] font-medium uppercase text-slate-500">
                              {key.chave_pix_tipo}
                            </span>
                          ) : null}
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(key.created_at)}
                        </span>
                      </div>
                      {key.chave_pix ? (
                        <div className="mt-2 flex gap-2">
                          <p className="flex-1 break-all font-mono text-xs text-slate-800">
                            {key.chave_pix}
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => void copyText(key.chave_pix, 'Chave PIX')}
                            title="Copiar"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs italic text-muted-foreground">Chave indisponível</p>
                      )}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            ) : null}
          </TabsContent>

          <TabsContent value="repasses" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">
                {detail.repasses.length} repasse{detail.repasses.length !== 1 ? 's' : ''}
              </p>
              {pendingRepasses.length > 0 ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                  {pendingRepasses.length} pendente{pendingRepasses.length > 1 ? 's' : ''}
                </span>
              ) : null}
            </div>

            {detail.repasses.length === 0 ? (
              <EmptyBlock message="Nenhum repasse registrado." icon={Wallet} />
            ) : (
              <div className="space-y-3">
                {detail.repasses.map((r) => (
                  <AdminRepasseCard
                    key={r.id}
                    repasse={r}
                    afiliadoId={a.id}
                    expanded={expandedRepasse === r.id}
                    onExpandedChange={(open) => setExpandedRepasse(open ? r.id : null)}
                    edit={getEdit(r.id, r)}
                    onEditChange={(patch) =>
                      setEdits((prev) => ({
                        ...prev,
                        [r.id]: { ...getEdit(r.id, r), ...patch },
                      }))
                    }
                    onOpenNf={onOpenNf}
                    onOpenPix={onOpenPix}
                    nfLoadingId={nfLoadingId}
                    pixLoadingId={pixLoadingId}
                    onPatch={onPatch}
                    patchPending={patchPending}
                    pixFile={pixDraft[r.id] ?? null}
                    onPixFileChange={(file) => setPixDraft((prev) => ({ ...prev, [r.id]: file }))}
                    onUploadComprovantePix={onUploadComprovantePix}
                    uploadPixPending={uploadPixPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clientes" className="mt-4">
            {clientes.length === 0 ? (
              <EmptyBlock message="Nenhum cliente indicado ainda." icon={Users} />
            ) : (
              <DetailSection title={`Indicações (${clientes.length})`} icon={Users}>
                <ul className="divide-y divide-slate-100">
                  {clientes.map((c, idx) => {
                    const empresaJoin = c.empresas;
                    const empresaNome = Array.isArray(empresaJoin)
                      ? empresaJoin[0]?.nome
                      : empresaJoin?.nome;
                    return (
                      <li
                        key={c.id ?? String(idx)}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {empresaNome || 'Empresa sem nome'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.created_at ? formatDate(c.created_at) : '—'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {typeof c.value === 'number' ? (
                            <span className="text-xs tabular-nums text-slate-600">
                              {formatBrl(Math.round(c.value * 100))}
                            </span>
                          ) : null}
                          <Badge variant="outline">{c.status ?? '—'}</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </DetailSection>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function AdminRepasseCard({
  repasse: r,
  afiliadoId,
  expanded,
  onExpandedChange,
  edit: e,
  onEditChange,
  onOpenNf,
  onOpenPix,
  nfLoadingId,
  pixLoadingId,
  onPatch,
  patchPending,
  pixFile,
  onPixFileChange,
  onUploadComprovantePix,
  uploadPixPending,
}: {
  repasse: AdminRepasseRow;
  afiliadoId: string;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  edit: { status: string; obs: string };
  onEditChange: (patch: Partial<{ status: string; obs: string }>) => void;
  onOpenNf: (afiliadoId: string, repasseId: string) => void;
  onOpenPix: (afiliadoId: string, repasseId: string) => void;
  nfLoadingId: string | null;
  pixLoadingId: string | null;
  onPatch: (repasseId: string, status: string, obs?: string) => void;
  patchPending: boolean;
  pixFile: File | null;
  onPixFileChange: (file: File | null) => void;
  onUploadComprovantePix: (repasseId: string, file: File) => Promise<void>;
  uploadPixPending: boolean;
}) {
  const hasPix = Boolean(r.comprovante_pix_object_key);
  const hasNf = Boolean(r.storage_object_key);
  const statusChoices = Array.from(new Set([...REPASSE_STATUS_OPTIONS, r.status])).filter((s) => {
    if (s !== 'pago') return true;
    return hasPix || r.status === 'pago';
  });
  const docLoading = nfLoadingId === r.id || pixLoadingId === r.id;
  const needsObservacao = e.status === 'divergencia' || e.status === 'cancelado';
  const isDirty =
    e.status !== r.status ||
    (needsObservacao && e.obs !== (r.admin_observacao ?? ''));
  const canUploadPix = r.status === 'aprovado';
  const pendingApproveSave = e.status === 'aprovado' && r.status !== 'aprovado';

  return (
    <Collapsible open={expanded} onOpenChange={onExpandedChange}>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50/80 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            <RepasseStatusIcon status={r.status} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">{formatBrl(r.valor_calculado_centavos)}</p>
              <p className="text-xs text-muted-foreground">Período {r.periodo_referencia}</p>
            </div>
            <RepasseStatusBadge status={r.status} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => onOpenNf(afiliadoId, r.id)}
                disabled={docLoading || !hasNf}
              >
                {nfLoadingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                Nota fiscal
              </Button>
              {hasPix ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => onOpenPix(afiliadoId, r.id)}
                  disabled={docLoading}
                >
                  {pixLoadingId === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
                  Comprovante PIX
                </Button>
              ) : null}
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  1. Conferir NF e status
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Analise a nota e salve o status. Observação é obrigatória só em Divergência ou Cancelado.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`status-${r.id}`}>Status</Label>
                  <Select
                    value={e.status}
                    onValueChange={(v) =>
                      onEditChange({
                        status: v,
                        obs:
                          v === 'divergencia' || v === 'cancelado'
                            ? e.obs
                            : '',
                      })
                    }
                  >
                    <SelectTrigger id={`status-${r.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusChoices.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s] ?? s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {needsObservacao ? (
                  <div className="space-y-1.5">
                    <Label htmlFor={`obs-${r.id}`}>
                      {e.status === 'divergencia' ? 'Motivo da divergência' : 'Motivo do cancelamento'}
                      <span className="ml-1 font-normal text-red-600">(obrigatório)</span>
                    </Label>
                    <Input
                      id={`obs-${r.id}`}
                      placeholder={
                        e.status === 'divergencia'
                          ? 'Ex.: valor da NF diferente do saldo'
                          : 'Ex.: solicitação cancelada pelo afiliado'
                      }
                      value={e.obs}
                      onChange={(ev) => onEditChange({ obs: ev.target.value })}
                    />
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                size="sm"
                disabled={
                  patchPending ||
                  !isDirty ||
                  (needsObservacao && !e.obs.trim() && e.status !== r.status)
                }
                onClick={() =>
                  onPatch(
                    r.id,
                    e.status,
                    needsObservacao ? e.obs : undefined
                  )
                }
              >
                {patchPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                Salvar status
              </Button>
              {pendingApproveSave ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Salve como <strong>Aprovado</strong> para liberar o envio do comprovante PIX.
                </p>
              ) : null}
            </div>

            {r.status === 'pago' ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                Repasse concluído. O afiliado pode visualizar o comprovante PIX no painel dele.
              </p>
            ) : canUploadPix ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    2. Pagar e enviar comprovante
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Anexe o comprovante do PIX. O repasse será marcado como <strong>pago</strong> automaticamente.
                  </p>
                  <label
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
                      pixFile ? 'border-primary/40 bg-primary/5' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-slate-700">
                      {pixFile ? pixFile.name : 'Clique para anexar o comprovante PIX'}
                    </span>
                    <span className="text-xs text-muted-foreground">PDF, PNG, JPG ou WEBP</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/jpeg,image/png,image/webp"
                      onChange={(ev) => onPixFileChange(ev.target.files?.[0] ?? null)}
                    />
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={!pixFile || uploadPixPending}
                    onClick={async () => {
                      if (!pixFile) return;
                      try {
                        await onUploadComprovantePix(r.id, pixFile);
                        onPixFileChange(null);
                      } catch {
                        /* toast no mutation */
                      }
                    }}
                  >
                    {uploadPixPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Upload className="h-3 w-3 mr-1.5" />}
                    Enviar comprovante e concluir pagamento
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground rounded-md border border-dashed px-3 py-3">
                O envio do comprovante PIX fica disponível após salvar o status como <strong>Aprovado</strong>.
              </p>
            )}

            {(r.historico_status?.length ?? 0) > 0 ? (
              <>
                <Separator />
                <RepasseStatusHistoricoTimeline items={r.historico_status ?? []} />
              </>
            ) : null}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
