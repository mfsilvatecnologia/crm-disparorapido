import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminClientsApi,
  type AdminClientFilters,
  type AdminClientListItem,
} from '../api/adminClientsApi';
import { formatBrazilianPhoneInput, formatCpfCnpjInput } from '../lib/brazilianPhone';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { useToast } from '@/shared/hooks/use-toast';
import { Check, Loader2, Mail, MailCheck, Pencil, RefreshCw, Send, UserPlus, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { UpdateAdminClientInput } from '../api/adminClientsApi';

const EVENT_TYPES = [
  { value: 'manual.resend', label: 'Reenvio manual' },
  { value: 'checkout.abandoned', label: 'Checkout abandonado' },
  { value: 'subscription.welcome', label: 'Boas-vindas assinatura' },
  { value: 'payment.pending', label: 'Pagamento pendente' },
  { value: 'payment.overdue', label: 'Pagamento em atraso' },
];

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch {
    return value;
  }
}

function formatMoney(value: number | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

type ClientEditForm = {
  empresaNome: string;
  empresaCnpj: string;
  cpfCnpj: string;
  telefone: string;
};

function buildClientPayload(form: ClientEditForm): UpdateAdminClientInput {
  return {
    empresaNome: form.empresaNome.trim(),
    empresaCnpj: form.empresaCnpj.replace(/\D/g, ''),
    cpfCnpj: form.cpfCnpj.replace(/\D/g, ''),
    telefone: form.telefone.trim() ? form.telefone.replace(/\D/g, '') : null,
  };
}

function formatBillingTypeLabel(value: string | null | undefined) {
  if (!value) return '—';
  const normalized = value.toUpperCase();
  if (normalized === 'CREDIT_CARD') return 'Cartão';
  if (normalized === 'PIX' || normalized === 'PIX_AUTOMATIC') return 'PIX';
  if (normalized === 'BOLETO') return 'Boleto';
  return value;
}

function formatAffiliateLabel(item: AdminClientListItem) {
  const aff = item.affiliateAttribution;
  if (!aff) return null;
  return `${aff.afiliadoNome} (${aff.afiliadoRefSlug})`;
}

export function AdminClientsTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const empresaIdFromQuery = searchParams.get('empresaId');
  const [filters, setFilters] = useState<AdminClientFilters>({ page: 1, limit: 20 });
  const [draft, setDraft] = useState<AdminClientFilters>({ page: 1, limit: 20 });
  const [selected, setSelected] = useState<AdminClientListItem | null>(null);
  const [eventType, setEventType] = useState('manual.resend');
  const [editForm, setEditForm] = useState<ClientEditForm>({
    empresaNome: '',
    empresaCnpj: '',
    cpfCnpj: '',
    telefone: '',
  });
  const [isEditingCadastro, setIsEditingCadastro] = useState(false);
  const [isSavingCadastro, setIsSavingCadastro] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-clients', filters],
    queryFn: () => adminClientsApi.listClients(filters),
  });

  const detailQuery = useQuery({
    queryKey: ['admin-client-detail', selected?.empresaId],
    queryFn: () => adminClientsApi.getClient(selected!.empresaId),
    enabled: Boolean(selected?.empresaId),
  });

  useEffect(() => {
    if (!empresaIdFromQuery) return;
    if (selected?.empresaId === empresaIdFromQuery) return;

    let cancelled = false;
    adminClientsApi
      .getClient(empresaIdFromQuery)
      .then((client) => {
        if (!cancelled) setSelected(client);
      })
      .catch(() => {
        if (!cancelled) {
          toast({
            title: 'Cliente não encontrado',
            description: 'Não foi possível abrir o cliente a partir do financeiro.',
            variant: 'destructive',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [empresaIdFromQuery, selected?.empresaId, toast]);

  const clearEmpresaIdFromUrl = () => {
    if (!searchParams.has('empresaId')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('empresaId');
    setSearchParams(next, { replace: true });
  };

  const syncFormFromSource = (source: AdminClientListItem) => {
    setEditForm({
      empresaNome: source.empresaNome ?? '',
      empresaCnpj: formatCpfCnpjInput(source.empresaCnpj ?? ''),
      cpfCnpj: formatCpfCnpjInput(source.cpfCnpj ?? ''),
      telefone: formatBrazilianPhoneInput(source.telefone ?? ''),
    });
  };

  useEffect(() => {
    const source = detailQuery.data ?? selected;
    if (!source || isEditingCadastro) return;
    syncFormFromSource(source);
  }, [selected, detailQuery.data, isEditingCadastro]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAdminClientInput) =>
      adminClientsApi.updateClient(selected!.empresaId, payload),
    onSuccess: (updated) => {
      toast({ title: 'Dados atualizados' });
      setSelected(updated);
      syncFormFromSource(updated);
      setIsEditingCadastro(false);
      setIsSavingCadastro(false);
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-client-detail'] });
    },
    onError: (error: Error) => {
      setIsSavingCadastro(false);
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const cancelCadastroEdit = () => {
    const source = detailQuery.data ?? selected;
    if (source) syncFormFromSource(source);
    setIsEditingCadastro(false);
  };

  const saveCadastro = () => {
    setIsSavingCadastro(true);
    updateMutation.mutate(buildClientPayload(editForm));
  };

  const confirmMutation = useMutation({
    mutationFn: (userId: string) => adminClientsApi.confirmEmail(userId),
    onSuccess: (result) => {
      toast({ title: 'E-mail confirmado', description: result.message });
      queryClient.invalidateQueries({ queryKey: ['admin-clients'] });
      queryClient.invalidateQueries({ queryKey: ['admin-client-detail'] });
    },
    onError: (error: Error) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const resendMutation = useMutation({
    mutationFn: (userId: string) => adminClientsApi.resendConfirmationEmail(userId),
    onSuccess: (result) => {
      toast({ title: 'E-mail reenviado', description: result.message });
    },
    onError: (error: Error) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const dispatchMutation = useMutation({
    mutationFn: ({ empresaId, eventType: evt }: { empresaId: string; eventType: string }) =>
      adminClientsApi.dispatchWebhook(empresaId, { eventType: evt }),
    onSuccess: (result) => {
      toast({
        title: result.success ? 'Webhook disparado' : 'Falha no webhook',
        description: result.responseStatus ? `HTTP ${result.responseStatus}` : 'Sem resposta',
        variant: result.success ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => toast({ title: 'Erro', description: error.message, variant: 'destructive' }),
  });

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.total / data.limit));
  }, [data]);

  const applyFilters = () => {
    setFilters({ ...draft, page: 1 });
  };

  const clientDetail = selected ? detailQuery.data ?? selected : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div>
            <Label>Nome</Label>
            <Input value={draft.nome ?? ''} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input value={draft.email ?? ''} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </div>
          <div>
            <Label>CNPJ</Label>
            <Input value={draft.cnpj ?? ''} onChange={(e) => setDraft({ ...draft, cnpj: e.target.value })} />
          </div>
          <div>
            <Label>CPF</Label>
            <Input value={draft.cpf ?? ''} onChange={(e) => setDraft({ ...draft, cpf: e.target.value })} />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              value={draft.telefone ?? ''}
              onChange={(e) => setDraft({ ...draft, telefone: e.target.value })}
            />
          </div>
          <div>
            <Label>Plano</Label>
            <Input value={draft.plano ?? ''} onChange={(e) => setDraft({ ...draft, plano: e.target.value })} />
          </div>
          <div>
            <Label>Forma de pagamento</Label>
            <Select
              value={draft.billingType ?? 'all'}
              onValueChange={(v) => setDraft({ ...draft, billingType: v === 'all' ? undefined : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="CREDIT_CARD">Cartão</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>E-mail confirmado</Label>
            <Select
              value={
                draft.emailConfirmed === undefined ? 'all' : draft.emailConfirmed ? 'yes' : 'no'
              }
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  emailConfirmed: v === 'all' ? undefined : v === 'yes',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Confirmado</SelectItem>
                <SelectItem value="no">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fatura em aberto</Label>
            <Select
              value={
                draft.hasOpenInvoice === undefined ? 'all' : draft.hasOpenInvoice ? 'yes' : 'no'
              }
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  hasOpenInvoice: v === 'all' ? undefined : v === 'yes',
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="yes">Sim</SelectItem>
                <SelectItem value="no">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Criação (de)</Label>
            <Input
              type="date"
              value={draft.createdFrom ?? ''}
              onChange={(e) => setDraft({ ...draft, createdFrom: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label>Criação (até)</Label>
            <Input
              type="date"
              value={draft.createdTo ?? ''}
              onChange={(e) => setDraft({ ...draft, createdTo: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label>Vencimento (de)</Label>
            <Input
              type="date"
              value={draft.dueFrom ?? ''}
              onChange={(e) => setDraft({ ...draft, dueFrom: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label>Vencimento (até)</Label>
            <Input
              type="date"
              value={draft.dueTo ?? ''}
              onChange={(e) => setDraft({ ...draft, dueTo: e.target.value || undefined })}
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-4">
            <Button onClick={applyFilters}>Aplicar filtros</Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Indicação</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.items ?? []).map((item) => (
                  <TableRow
                    key={item.userId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelected(item)}
                  >
                    <TableCell>
                      <div className="font-medium">{item.nome}</div>
                      <div className="text-xs text-muted-foreground">{item.empresaNome}</div>
                    </TableCell>
                    <TableCell>
                      {item.affiliateAttribution ? (
                        <Badge
                          variant="outline"
                          className="font-normal border-violet-200 bg-violet-50 text-violet-900"
                          title={`Ref: ${item.affiliateAttribution.afiliadoRefSlug}`}
                        >
                          <UserPlus className="h-3 w-3 mr-1 shrink-0" />
                          {item.affiliateAttribution.afiliadoNome}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{item.email}</div>
                      {!item.emailConfirmedAt && (
                        <Badge variant="outline" className="mt-1 text-amber-700 border-amber-300">
                          E-mail pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.planoAtual ?? item.subscription?.produtoId ?? '—'}</TableCell>
                    <TableCell>{formatBillingTypeLabel(item.subscription?.billingType)}</TableCell>
                    <TableCell>{formatDate(item.subscription?.nextDueDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary">{item.subscription?.status ?? 'sem assinatura'}</Badge>
                        {item.subscription?.hasOpenInvoice && (
                          <Badge variant="destructive">Fatura em aberto</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? `${data.total} cliente(s)` : ''} — página {filters.page ?? 1} de {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: Math.max((f.page ?? 1) - 1, 1) }))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Próxima
          </Button>
        </div>
      </div>

      <Sheet
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setIsEditingCadastro(false);
            setIsSavingCadastro(false);
            clearEmpresaIdFromUrl();
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selected?.nome}</SheetTitle>
            <SheetDescription>{selected?.email}</SheetDescription>
          </SheetHeader>

          {selected && clientDetail && (
            <div className="mt-6 space-y-6">
              <div className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold">Dados cadastrais</h4>
                  {!isEditingCadastro ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setIsEditingCadastro(true)}
                      aria-label="Editar dados cadastrais"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        disabled={isSavingCadastro}
                        onClick={saveCadastro}
                        aria-label="Salvar"
                      >
                        {isSavingCadastro ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        disabled={isSavingCadastro}
                        onClick={cancelCadastroEdit}
                        aria-label="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditingCadastro ? (
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Empresa:</span> {selected.empresaNome}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Indicado por:</span>{' '}
                      {formatAffiliateLabel(clientDetail) ?? (
                        <span className="text-muted-foreground">Cadastro direto (sem afiliado)</span>
                      )}
                    </p>
                    {clientDetail.affiliateAttribution ? (
                      <p className="text-xs text-muted-foreground">
                        Código ref: {clientDetail.affiliateAttribution.afiliadoRefSlug}
                      </p>
                    ) : null}
                    <p>
                      <span className="text-muted-foreground">CNPJ:</span>{' '}
                      {formatCpfCnpjInput(selected.empresaCnpj ?? '') || '—'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">CPF/CNPJ login:</span>{' '}
                      {formatCpfCnpjInput(selected.cpfCnpj ?? '') || '—'}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Telefone:</span>{' '}
                      {formatBrazilianPhoneInput(selected.telefone ?? '') || '—'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <Label htmlFor="edit-empresa-nome" className="text-xs">
                        Empresa
                      </Label>
                      <Input
                        id="edit-empresa-nome"
                        className="mt-1 h-8 text-sm"
                        value={editForm.empresaNome}
                        onChange={(e) => setEditForm((f) => ({ ...f, empresaNome: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-empresa-cnpj" className="text-xs">
                        CNPJ / CPF da empresa
                      </Label>
                      <Input
                        id="edit-empresa-cnpj"
                        className="mt-1 h-8 text-sm"
                        inputMode="numeric"
                        value={editForm.empresaCnpj}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, empresaCnpj: formatCpfCnpjInput(e.target.value) }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cpf-cnpj" className="text-xs">
                        CPF/CNPJ login
                      </Label>
                      <Input
                        id="edit-cpf-cnpj"
                        className="mt-1 h-8 text-sm"
                        inputMode="numeric"
                        value={editForm.cpfCnpj}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, cpfCnpj: formatCpfCnpjInput(e.target.value) }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-telefone" className="text-xs">
                        Telefone
                      </Label>
                      <Input
                        id="edit-telefone"
                        className="mt-1 h-8 text-sm"
                        type="tel"
                        inputMode="numeric"
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        value={editForm.telefone}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, telefone: formatBrazilianPhoneInput(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">E-mail:</span> {selected.email}
                </p>
                <p>
                  <span className="text-muted-foreground">E-mail confirmado:</span>{' '}
                  {selected.emailConfirmedAt ? formatDate(selected.emailConfirmedAt) : 'Não'}
                </p>
                {selected.subscription && (
                  <>
                    <p>
                      <span className="text-muted-foreground">Pagamento:</span>{' '}
                      {formatBillingTypeLabel(selected.subscription.billingType)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Assinatura:</span>{' '}
                      {selected.subscription.status} — {formatMoney(selected.subscription.value)}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Próximo vencimento:</span>{' '}
                      {formatDate(selected.subscription.nextDueDate)}
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start px-0 text-primary"
                  onClick={() =>
                    navigate(`/app/admin?tab=financeiro&empresaId=${encodeURIComponent(selected.empresaId)}`)
                  }
                >
                  Ver financeiro deste cliente
                </Button>
                <Button
                  variant="outline"
                  disabled={Boolean(selected.emailConfirmedAt) || confirmMutation.isPending}
                  onClick={() => confirmMutation.mutate(selected.userId)}
                >
                  <MailCheck className="h-4 w-4 mr-2" />
                  Confirmar e-mail manualmente
                </Button>
                <Button
                  variant="outline"
                  disabled={Boolean(selected.emailConfirmedAt) || resendMutation.isPending}
                  onClick={() => resendMutation.mutate(selected.userId)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar e-mail de confirmação
                </Button>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label>Disparar webhook n8n</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((evt) => (
                      <SelectItem key={evt.value} value={evt.value}>
                        {evt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={dispatchMutation.isPending}
                  onClick={() =>
                    dispatchMutation.mutate({ empresaId: selected.empresaId, eventType })
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Disparar webhook
                </Button>
              </div>

              {detailQuery.data?.subscriptions && detailQuery.data.subscriptions.length > 1 && (
                <div className="space-y-2 border-t pt-4">
                  <Label>Histórico de assinaturas</Label>
                  <ul className="text-sm space-y-1">
                    {detailQuery.data.subscriptions.map((sub) => (
                      <li key={sub.id} className="text-muted-foreground">
                        {sub.status} — {formatDate(sub.createdAt)} — {formatMoney(sub.value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
