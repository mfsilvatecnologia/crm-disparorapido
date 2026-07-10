import { useState } from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/utils';
import type { AffiliateFinanceiroPainel } from '../types';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';
import { useAffiliateCode } from '../hooks/useAffiliateCode';
import { AffiliateCadastroStatusBanner } from '../components/AffiliateCadastroStatusBanner';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader, AffiliatePageLoading } from '../components/AffiliatePageLayout';

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

function currentPeriodo(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatPeriodoLabel(periodo: string): string {
  const [year, month] = periodo.split('-').map(Number);
  if (!year || !month) return periodo;
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
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
  const { isAffiliate, isLoading: loadingAffiliate } = useIsAffiliateUser();
  const { data: affiliateCode } = useAffiliateCode();
  const [periodo, setPeriodo] = useState(currentPeriodo);
  const { data: statistics, isLoading: loadingStatistics, isError, error } = useAffiliateStatistics();
  const { data: monthlyStatistics, isLoading: loadingMonthly } = useAffiliateStatistics(periodo);

  const isManual = statistics?.modoRepasse === 'MANUAL_NF';
  const fp = monthlyStatistics?.financeiroPainel ?? EMPTY_FINANCEIRO;
  const loadingSaldo = loadingStatistics;
  const loadingFaturas = loadingMonthly;

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
        statusCadastro={affiliateCode?.statusCadastro}
        motivoRejeicao={affiliateCode?.motivoRejeicao}
      />
      <AffiliatePageHeader title="Financeiro" />

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
          <PainelMetric
            label="Saldo"
            hint="Valor referente as comissões das indicações que já foram pagas. Sujeito a alterações até a data de fechamento do mês, por motivos de cancelamento ou estorno."
            value={formatMoneyFromCentavos(statistics?.saldoDisponivelCentavos ?? 0)}
            subline="Saldo disponível para Transferência"
            isLoading={loadingSaldo}
          />
          <PainelMetric
            label="Transferências em análise"
            hint="Valores aguardando o processamento da nota fiscal e a efetivação do pagamento."
            value={formatMoneyFromCentavos(statistics?.saldoPendenteRepasseCentavos ?? 0)}
            subline="Solicitações aguardando pagamento"
            isLoading={loadingSaldo}
          />
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-600">Visão do mês</p>
            <p className="text-xs text-slate-500">
              Faturas das suas indicações em {formatPeriodoLabel(periodo)}.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="periodo_financeiro">Mês de referência</Label>
            <Input
              id="periodo_financeiro"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full max-w-xs"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <PainelMetric
            label="Total de faturas"
            hint="Pagamentos confirmados no mês e novas indicações criadas no período."
            value={String(fp.faturasTotal)}
            subline="no mês"
            isLoading={loadingFaturas}
          />
          <PainelMetric
            label="Pagas"
            hint="Indicações com pagamento confirmado neste mês."
            value={`${fp.faturasPagas} ${pctLabel(fp.faturasPagas, fp.faturasTotal)}`}
            isLoading={loadingFaturas}
          />
          <PainelMetric
            label="Abertas"
            hint="Novas indicações do mês em teste, aguardando pagamento."
            value={`${fp.faturasAbertas} ${pctLabel(fp.faturasAbertas, fp.faturasTotal)}`}
            isLoading={loadingFaturas}
          />
          <PainelMetric
            label="Vencidas"
            hint="Indicações inadimplentes."
            value={`${fp.faturasExpiradas} ${pctLabel(fp.faturasExpiradas, fp.faturasTotal)}`}
            isLoading={loadingFaturas}
          />
          <PainelMetric
            label="Canceladas"
            hint="Novas indicações do mês já canceladas."
            value={`${fp.faturasCanceladas} ${pctLabel(fp.faturasCanceladas, fp.faturasTotal)}`}
            isLoading={loadingFaturas}
          />
        </div>
      </section>
    </div>
  );
}
