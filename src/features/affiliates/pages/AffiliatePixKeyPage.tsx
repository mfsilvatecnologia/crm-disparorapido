import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Clock, KeyRound, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';
import { useAffiliatePixKeys } from '../hooks/useAffiliatePixKeys';
import { AffiliateCadastroStatusBanner } from '../components/AffiliateCadastroStatusBanner';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader, AffiliatePageLoading } from '../components/AffiliatePageLayout';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from '../hooks/queryKeys';
import { CHAVE_PIX_TIPOS_REPASSE } from '../utils/chavePixTipos';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function AffiliatePixKeyPage() {
  const queryClient = useQueryClient();
  const { isAffiliate, isLoading: loadingAffiliate, code } = useIsAffiliateUser();
  const { data: statistics } = useAffiliateStatistics();
  const [chavePix, setChavePix] = useState('');
  const [chavePixTipo, setChavePixTipo] = useState('');
  const [pixMsg, setPixMsg] = useState<string | null>(null);

  const isManual = (statistics?.modoRepasse ?? code?.modoRepasse) === 'MANUAL_NF';

  const { data: pixKeys = [], isLoading: loadingKeys } = useAffiliatePixKeys(isManual);

  const activeKey = pixKeys.find((k) => k.ativa) ?? null;
  const historyKeys = pixKeys.filter((k) => !k.ativa);

  const pixMutation = useMutation({
    mutationFn: () =>
      affiliatesApi.patchAffiliateChavePix({
        chave_pix: chavePix.trim(),
        chave_pix_tipo: chavePixTipo,
      }),
    onSuccess: async () => {
      setPixMsg('Chave PIX salva com sucesso.');
      setChavePix('');
      setChavePixTipo('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: affiliateKeys.code() }),
        queryClient.invalidateQueries({ queryKey: affiliateKeys.pixKeys() }),
      ]);
    },
    onError: (e: unknown) => {
      setPixMsg(e instanceof Error ? e.message : 'Não foi possível salvar a chave PIX.');
    },
  });

  if (loadingAffiliate) {
    return <AffiliatePageLoading />;
  }

  if (!isAffiliate) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Programa de afiliados</AlertTitle>
        <AlertDescription>Sua conta não está vinculada a um cadastro de afiliado.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={AFFILIATE_PAGE_CLASS}>
      <AffiliateCadastroStatusBanner
        statusCadastro={code?.statusCadastro}
        motivoRejeicao={code?.motivoRejeicao}
      />
      <AffiliatePageHeader title="Chave PIX para repasse" />

      {!isManual ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cadastro de chave PIX não disponível</AlertTitle>
          <AlertDescription>
            Afiliados com repasse automático via Asaas não precisam cadastrar chave PIX neste painel.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <KeyRound className="h-5 w-5" />
                {activeKey ? 'Atualizar chave PIX' : 'Cadastrar chave PIX'}
              </CardTitle>
              <CardDescription>
                Usada apenas para pagamento após aprovação da sua NF. Não é exibida publicamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chave_pix">Chave PIX</Label>
                <Input
                  id="chave_pix"
                  autoComplete="off"
                  value={chavePix}
                  onChange={(e) => setChavePix(e.target.value)}
                  placeholder="Informe a chave conforme o tipo selecionado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chave_pix_tipo">Tipo</Label>
                <Select value={chavePixTipo} onValueChange={setChavePixTipo}>
                  <SelectTrigger id="chave_pix_tipo">
                    <SelectValue placeholder="Selecione o tipo da chave" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHAVE_PIX_TIPOS_REPASSE.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {pixMsg ? <p className="text-sm text-muted-foreground">{pixMsg}</p> : null}
              <Button
                type="button"
                onClick={() => pixMutation.mutate()}
                disabled={pixMutation.isPending || chavePix.trim().length < 3 || !chavePixTipo}
              >
                {pixMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  'Salvar chave PIX'
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Chave ativa e histórico</CardTitle>
              <CardDescription>A chave ativa é a que será usada no próximo repasse.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {loadingKeys ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : pixKeys.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <KeyRound className="h-9 w-9 opacity-30" />
                  <p className="text-sm font-medium text-slate-700">Nenhuma chave cadastrada ainda</p>
                  <p className="text-xs max-w-xs">Cadastre uma chave PIX ao lado para receber seus repasses.</p>
                </div>
              ) : (
                <>
                  {activeKey ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 className="h-4 w-4" />
                          Chave ativa
                        </span>
                        {activeKey.chavePixTipo ? (
                          <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-emerald-800 uppercase">
                            {activeKey.chavePixTipo}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 font-mono text-base font-semibold text-slate-900">{activeKey.chavePix}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cadastrada em {formatDateTime(activeKey.createdAt)}
                      </p>
                    </div>
                  ) : null}

                  {historyKeys.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Chaves anteriores
                      </p>
                      <ul className="space-y-2">
                        {historyKeys.map((key) => (
                          <li
                            key={key.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-sm text-slate-700">{key.chavePix}</p>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(key.createdAt)}
                              </p>
                            </div>
                            {key.chavePixTipo ? (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 uppercase">
                                {key.chavePixTipo}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
