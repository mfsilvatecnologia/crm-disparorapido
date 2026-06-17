import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  Upload,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/utils/utils';
import {
  adminAffiliatesApi,
  type AdminAfiliadoDetail,
  type AdminAfiliadoListItem,
  type AdminRepasseRow,
} from '@/features/admin/api/adminAffiliatesApi';

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

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
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
  const [nfLoadingId, setNfLoadingId] = useState<string | null>(null);
  const [pixLoadingId, setPixLoadingId] = useState<string | null>(null);
  const [searchAfiliado, setSearchAfiliado] = useState('');
  const [cadastroFilter, setCadastroFilter] = useState<'all' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('PENDENTE');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectMotivo, setRejectMotivo] = useState('');
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
    const q = searchAfiliado.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) =>
        (a.nome ?? a.ref_slug).toLowerCase().includes(q) ||
        a.ref_slug.toLowerCase().includes(q) ||
        a.modo_repasse.toLowerCase().includes(q) ||
        a.tipo_plano.toLowerCase().includes(q) ||
        a.status_assinatura.toLowerCase().includes(q)
    );
  }, [afiliadosQuery.data, searchAfiliado]);

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
    mutationFn: (vars: { afiliadoId: string; action: 'aprovar' | 'rejeitar'; motivo?: string }) =>
      adminAffiliatesApi.patchCadastro(vars.afiliadoId, {
        action: vars.action,
        motivo: vars.motivo,
      }),
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'afiliados'] });
      toast({
        title: vars.action === 'aprovar' ? 'Cadastro aprovado' : 'Cadastro rejeitado',
        description:
          vars.action === 'aprovar'
            ? 'O afiliado já pode usar o link de indicação.'
            : 'O afiliado foi notificado no painel.',
      });
      setRejectDialogOpen(false);
      setRejectMotivo('');
    },
    onError: (e: unknown) => {
      toast({
        title: 'Erro ao atualizar cadastro',
        description: e instanceof Error ? e.message : 'Tente novamente.',
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
    setSelectedAfiliadoId(afiliadoId);
    setMainTab('afiliados');
  };

  const pendentesCount = pendentesQuery.data?.length ?? 0;
  const pendentesCadastroCount = afiliadosQuery.data?.pendentes_cadastro ?? 0;
  const afiliadosCount = afiliadosQuery.data?.total ?? afiliadosQuery.data?.items.length ?? 0;

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
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, plano…"
                      value={searchAfiliado}
                      onChange={(e) => setSearchAfiliado(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AfiliadosTable
                loading={afiliadosQuery.isLoading}
                error={afiliadosQuery.isError}
                items={filteredAfiliados}
                selectedId={selectedAfiliadoId}
                onSelect={setSelectedAfiliadoId}
                emptyMessage={
                  searchAfiliado.trim()
                    ? 'Nenhum afiliado encontrado para esta busca.'
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
                            <span className="font-medium">{nomeById.get(r.afiliado_id) ?? '—'}</span>
                            <span className="mt-0.5 block font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                              {r.afiliado_id}
                            </span>
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

      <Sheet open={Boolean(selectedAfiliadoId)} onOpenChange={(open) => !open && setSelectedAfiliadoId(null)}>
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
            {detailQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : detailQuery.isError || !detailQuery.data ? (
              <ErrorBlock message="Não foi possível carregar o afiliado." />
            ) : (
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
                onRejectCadastro={() => setRejectDialogOpen(true)}
                cadastroPending={cadastroMutation.isPending}
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
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar cadastro de afiliado</DialogTitle>
            <DialogDescription>
              O afiliado verá o status no painel. Informe um motivo opcional.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição (opcional)"
            value={rejectMotivo}
            onChange={(e) => setRejectMotivo(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!selectedAfiliadoId || cadastroMutation.isPending}
              onClick={() => {
                if (!selectedAfiliadoId) return;
                cadastroMutation.mutate({
                  afiliadoId: selectedAfiliadoId,
                  action: 'rejeitar',
                  motivo: rejectMotivo.trim() || undefined,
                });
              }}
            >
              {cadastroMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Rejeitar cadastro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
            <TableHead>Nome</TableHead>
            <TableHead>Repasse</TableHead>
            <TableHead>Split</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Cadastro</TableHead>
            <TableHead>Assinatura</TableHead>
            <TableHead>Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow
              key={a.id}
              className={cn('cursor-pointer', selectedId === a.id && 'bg-primary/5')}
              onClick={() => onSelect(a.id)}
            >
              <TableCell className="font-medium">{a.nome ?? a.ref_slug}</TableCell>
              <TableCell className="text-muted-foreground">
                {MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse}
              </TableCell>
              <TableCell>{a.split_percentual}%</TableCell>
              <TableCell>{a.tipo_plano}</TableCell>
              <TableCell>
                <CadastroStatusBadge status={a.status_cadastro} />
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {a.status_assinatura}
                </Badge>
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
  cadastroPending,
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
  onRejectCadastro: () => void;
  cadastroPending: boolean;
  onUploadComprovantePix: (repasseId: string, file: File) => Promise<void>;
  uploadPixPending: boolean;
}) {
  const { toast } = useToast();
  const a = detail.afiliado;
  const [edits, setEdits] = useState<Record<string, { status: string; obs: string }>>({});
  const [pixDraft, setPixDraft] = useState<Record<string, File | null>>({});
  const [expandedRepasse, setExpandedRepasse] = useState<string | null>(
    detail.repasses[0]?.id ?? null
  );

  const getEdit = (id: string, row: AdminRepasseRow) =>
    edits[id] ?? { status: row.status, obs: row.admin_observacao ?? '' };

  const copyPix = async () => {
    if (!a.chave_pix) return;
    try {
      await navigator.clipboard.writeText(a.chave_pix);
      toast({ title: 'Chave PIX copiada' });
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const pendingRepasses = detail.repasses.filter((r) =>
    ['nf_enviada', 'em_analise', 'aprovado', 'aguardando_nf'].includes(r.status)
  );

  return (
    <div className="space-y-6 text-sm">
      <div className="rounded-lg border bg-slate-50/80 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <CadastroStatusBadge status={a.status_cadastro} />
          {a.status_cadastro === 'PENDENTE' ? (
            <>
              <Button type="button" size="sm" disabled={cadastroPending} onClick={onApproveCadastro}>
                {cadastroPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Aprovar
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={cadastroPending} onClick={onRejectCadastro}>
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </>
          ) : null}
        </div>
        {a.status_cadastro === 'REJEITADO' && a.motivo_rejeicao ? (
          <p className="text-xs text-red-700">
            <span className="font-medium">Motivo:</span> {a.motivo_rejeicao}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{MODO_REPASSE_LABEL[a.modo_repasse] ?? a.modo_repasse}</Badge>
          <Badge variant="outline">Split {a.split_percentual}%</Badge>
          <Badge variant="outline">{a.tipo_plano}</Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Chave PIX</p>
          {a.chave_pix ? (
            <div className="mt-1 flex gap-2">
              <p className="flex-1 font-mono text-xs break-all rounded-md border bg-white p-2.5">{a.chave_pix}</p>
              <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => void copyPix()} title="Copiar">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="mt-1 text-muted-foreground italic">Não informada pelo afiliado</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900">Repasses ({detail.repasses.length})</h4>
          {pendingRepasses.length > 0 ? (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
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
      </div>
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
  const isDirty = e.status !== r.status || e.obs !== (r.admin_observacao ?? '');
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
          <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
            {r.admin_observacao && e.obs === (r.admin_observacao ?? '') ? (
              <p className="text-xs text-muted-foreground rounded-md bg-slate-50 p-2">
                <span className="font-medium">Obs. anterior:</span> {r.admin_observacao}
              </p>
            ) : null}

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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">1. Conferir NF e status</p>
              <p className="text-xs text-muted-foreground">
                Visualize a nota fiscal, analise e salve o status como <strong>Aprovado</strong> antes do pagamento.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`status-${r.id}`}>Status</Label>
                  <Select value={e.status} onValueChange={(v) => onEditChange({ status: v })}>
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
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`obs-${r.id}`}>Observação interna</Label>
                  <Input
                    id={`obs-${r.id}`}
                    placeholder="Mensagem visível no histórico do afiliado, se aplicável"
                    value={e.obs}
                    onChange={(ev) => onEditChange({ obs: ev.target.value })}
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={patchPending || !isDirty}
                onClick={() => onPatch(r.id, e.status, e.obs)}
              >
                {patchPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                Salvar status
              </Button>
              {pendingApproveSave ? (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Salve como <strong>Aprovado</strong> para liberar o envio do comprovante PIX.
                </p>
              ) : null}
            </div>

            {r.status === 'pago' ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                Repasse concluído. O afiliado pode visualizar o comprovante PIX no painel dele.
              </p>
            ) : canUploadPix ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">2. Pagar e enviar comprovante</p>
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
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
