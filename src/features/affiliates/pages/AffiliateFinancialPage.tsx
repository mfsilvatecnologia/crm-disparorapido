import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, HelpCircle, Loader2, Wallet, KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/utils';
import type { AffiliateFinanceiroPainel } from '../types';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from '../hooks/queryKeys';

const EMPTY_FINANCEIRO: AffiliateFinanceiroPainel = {
  vendasBrutasCentavos: 0,
  ganhoLiquidoCentavos: 0,
  totalRecuperacaoCentavos: 0,
  faturasTotal: 0,
  faturasPagas: 0,
  faturasAbertas: 0,
  faturasCanceladas: 0,
  faturasExpiradas: 0,
};

function formatMoneyFromCentavos(centavos: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100);
}

function pctLabel(part: number, total: number): string {
  if (total <= 0) return '(0%)';
  const p = (part / total) * 100;
  return `(${p.toFixed(2)}%)`;
}

function PainelMetric({
  label,
  hint,
  value,
  subline,
  isLoading,
  className,
}: {
  label: string;
  hint: string;
  value: string;
  subline?: string;
  isLoading: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="inline-flex shrink-0 cursor-default text-slate-400" title={hint}>
          <HelpCircle className="h-4 w-4" aria-hidden />
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-32" />
      ) : (
        <>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
          {subline ? <p className="mt-1 text-xs text-slate-500">{subline}</p> : null}
        </>
      )}
    </div>
  );
}

export function AffiliateFinancialPage() {
  const queryClient = useQueryClient();
  const { isAffiliate, isLoading: loadingAffiliate } = useIsAffiliateUser();
  const { data: statistics, isLoading, isError, error } = useAffiliateStatistics();
  const [chavePix, setChavePix] = useState('');
  const [chavePixTipo, setChavePixTipo] = useState('');
  const [pixMsg, setPixMsg] = useState<string | null>(null);

  const isManual = statistics?.modoRepasse === 'MANUAL_NF';
  const fp = statistics?.financeiroPainel ?? EMPTY_FINANCEIRO;

  const pixMutation = useMutation({
    mutationFn: () =>
      affiliatesApi.patchAffiliateChavePix({
        chave_pix: chavePix.trim(),
        ...(chavePixTipo.trim() ? { chave_pix_tipo: chavePixTipo.trim() } : {}),
      }),
    onSuccess: async () => {
      setPixMsg('Chave PIX salva com sucesso.');
      setChavePix('');
      await queryClient.invalidateQueries({ queryKey: affiliateKeys.code() });
    },
    onError: (e: unknown) => {
      setPixMsg(e instanceof Error ? e.message : 'Não foi possível salvar a chave PIX.');
    },
  });

  if (loadingAffiliate) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Carregando…</span>
      </div>
    );
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
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financeiro</h1>
        <h2 className="pt-2 text-lg font-semibold text-slate-900">Acompanhe as estatísticas de suas vendas</h2>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      {statistics?.tipoPlano === 'MENSALIDADE' &&
        statistics?.statusAssinatura === 'INADIMPLENTE' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mensalidade do programa em atraso</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Regularize para manter o programa de indicações ativo.</span>
              {statistics.mensalidadePagamentoUrl ? (
                <a
                  href={statistics.mensalidadePagamentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-medium underline underline-offset-4"
                >
                  Abrir cobrança
                </a>
              ) : null}
            </AlertDescription>
          </Alert>
        )}

      {isManual && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Saldo disponível</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <p className="text-2xl font-bold">
                    {formatMoneyFromCentavos(statistics?.saldoDisponivelCentavos ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimativa após NF já quitadas (status pago)</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Em análise / pendente</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <p className="text-2xl font-bold">
                    {formatMoneyFromCentavos(statistics?.saldoPendenteRepasseCentavos ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Valores em solicitações ainda não pagas</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <section className="space-y-3">
        <p className="text-sm font-medium text-slate-600">
          Comissões acumuladas das suas indicações:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PainelMetric
            label="Total de vendas"
            hint="Soma de todas as suas comissões sobre pagamentos confirmados dos clientes indicados (inclui renovações)."
            value={formatMoneyFromCentavos(fp.vendasBrutasCentavos)}
            isLoading={isLoading}
          />
          <PainelMetric
            label="Total em recuperação"
            hint="Valor bruto das assinaturas em atraso ou suspensas por inadimplência (past_due / suspended)."
            value={formatMoneyFromCentavos(fp.totalRecuperacaoCentavos)}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-slate-600">
          Faturas totais brutas de acordo com as suas indicações:
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <PainelMetric
            label="Total de faturas"
            hint="Quantidade de assinaturas vinculadas ao seu código de afiliado."
            value={String(fp.faturasTotal)}
            subline="assinaturas"
            isLoading={isLoading}
          />
          <PainelMetric
            label="Pagas"
            hint="Assinaturas com status ativo (pagamento em dia)."
            value={`${fp.faturasPagas} ${pctLabel(fp.faturasPagas, fp.faturasTotal)}`}
            isLoading={isLoading}
          />
          <PainelMetric
            label="Abertas"
            hint="Em teste, aguardando pagamento, inativas ou em atraso ainda não canceladas."
            value={`${fp.faturasAbertas} ${pctLabel(fp.faturasAbertas, fp.faturasTotal)}`}
            isLoading={isLoading}
          />
          <PainelMetric
            label="Canceladas"
            hint="Assinaturas canceladas pelo cliente ou sistema."
            value={`${fp.faturasCanceladas} ${pctLabel(fp.faturasCanceladas, fp.faturasTotal)}`}
            isLoading={isLoading}
          />
          <PainelMetric
            label="Expiradas"
            hint="Assinaturas encerradas por limite de cobranças ou validade."
            value={`${fp.faturasExpiradas} ${pctLabel(fp.faturasExpiradas, fp.faturasTotal)}`}
            isLoading={isLoading}
          />
        </div>
      </section>

      {isManual && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <KeyRound className="h-5 w-5" />
              Chave PIX para repasse
            </CardTitle>
            <CardDescription>
              Usada apenas para pagamento após aprovação da sua NF. Não é exibida publicamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-lg space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chave_pix">Chave PIX</Label>
              <Input
                id="chave_pix"
                autoComplete="off"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="CPF, e-mail, telefone, EVP ou chave aleatória"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chave_pix_tipo">Tipo (opcional)</Label>
              <Input
                id="chave_pix_tipo"
                value={chavePixTipo}
                onChange={(e) => setChavePixTipo(e.target.value)}
                placeholder="ex.: email, cpf, cnpj, phone, EVP"
              />
            </div>
            {pixMsg && <p className="text-sm text-muted-foreground">{pixMsg}</p>}
            <Button type="button" onClick={() => pixMutation.mutate()} disabled={pixMutation.isPending}>
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
      )}
    </div>
  );
}
