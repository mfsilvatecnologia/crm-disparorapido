import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
  KeyRound,
  Loader2,
  Wallet,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/utils/utils';
import { useIsAffiliateUser } from '../hooks/useIsAffiliateUser';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader, AffiliatePageLoading } from '../components/AffiliatePageLayout';
import { AffiliateRepasseMonthList } from '../components/AffiliateRepasseMonthList';
import { disparoBrand } from '../utils/repasseStatus';

const FLUXO_PASSOS = [
  {
    icon: KeyRound,
    title: 'Chave PIX cadastrada',
    desc: 'Informe a chave PIX para receber o repasse após aprovação da NF.',
  },
  {
    icon: FileText,
    title: 'Envie a nota fiscal',
    desc: 'Uma NF por mês: selecione o período na lista e anexe PDF ou XML referente àquele mês.',
  },
  {
    icon: CheckCircle2,
    title: 'Acompanhe e receba',
    desc: 'Após análise e aprovação, o pagamento em PIX é feito em até 30 dias corridos.',
  },
] as const;

export function AffiliateInvoicesPage() {
  const { isAffiliate, isLoading: loadingAffiliate, code } = useIsAffiliateUser();
  const { data: statistics, isLoading, isError, error } = useAffiliateStatistics();

  const mensalidadeUrl =
    statistics?.mensalidadePagamentoUrl ?? code?.mensalidadePagamentoUrl ?? null;
  const isManual = statistics?.modoRepasse === 'MANUAL_NF';
  const affiliateId = statistics?.codigoAfiliadoId ?? code?.codigoAfiliadoId;

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
      <AffiliatePageHeader title="Notas fiscais" />

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      {isManual ? (
        <>
          <Card className="border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Como funciona</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {FLUXO_PASSOS.map((passo, i) => (
                  <li key={passo.title} className="flex gap-3">
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', disparoBrand.stepBadge)}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                        <passo.icon className="h-4 w-4 text-muted-foreground" />
                        {passo.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{passo.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="link" className="mt-4 h-auto p-0 text-sm" asChild>
                <Link to="/app/afiliados/chave-pix">
                  <KeyRound className="h-3.5 w-3.5 mr-1" />
                  Cadastrar chave PIX
                </Link>
              </Button>
            </CardContent>
          </Card>

          {affiliateId ? (
            <AffiliateRepasseMonthList
              affiliateId={affiliateId}
              saldosPorMes={statistics?.saldosPorMes ?? []}
              loading={isLoading}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Recarregue a página para carregar seus dados de afiliado.</AlertDescription>
            </Alert>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-muted-foreground" />
                Mensalidade do programa
              </CardTitle>
              <CardDescription>
                Plano com mensalidade: abra a cobrança no Asaas quando houver fatura pendente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : mensalidadeUrl ? (
                <Button asChild variant="outline" className="gap-2">
                  <a href={mensalidadeUrl} target="_blank" rel="noopener noreferrer">
                    Abrir cobrança da mensalidade
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Não há cobrança pendente ou você está no plano isento.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                NFS-e na subconta Asaas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Notas e comprovantes da sua subconta Asaas (incluindo repasses por split) ficam no portal Asaas. Use-o
                para baixar PDF/XML oficiais.
              </p>
              <p className="text-xs">
                Este painel não substitui o extrato fiscal do Asaas.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
