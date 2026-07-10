import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { ShareLinkCard } from '../components/ShareLinkCard';
import {
  AffiliateCadastroStatusBanner,
  isAffiliateCadastroApproved,
} from '../components/AffiliateCadastroStatusBanner';
import { AffiliateCadastroResubmitSection } from '../components/AffiliateCadastroResubmitSection';
import { AFFILIATE_PAGE_CLASS, AffiliatePageHeader } from '../components/AffiliatePageLayout';
import { useAffiliateCode } from '../hooks/useAffiliateCode';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';
import { useQuery } from '@tanstack/react-query';
import { affiliatesApi } from '../api/affiliatesApi';
import { affiliateKeys } from '../hooks/queryKeys';

export function AffiliateDashboardPage() {
  const {
    data: code,
    isLoading: loadingCode,
    isError: isCodeError,
    error: codeError,
  } = useAffiliateCode();
  const { data: statistics, isError: isStatsError, error: statsError } = useAffiliateStatistics();

  const hasError = isCodeError || isStatsError;
  const cadastroAprovado = isAffiliateCadastroApproved(code?.statusCadastro);
  const cadastroRejeitadoComCorrecao =
    code?.statusCadastro === 'REJEITADO' && code?.permiteCorrecaoCadastro !== false;

  const { data: toolStatus } = useQuery({
    queryKey: affiliateKeys.toolSubscription(),
    queryFn: affiliatesApi.getAffiliateToolSubscriptionStatus,
    enabled: cadastroAprovado,
  });

  return (
    <div className={AFFILIATE_PAGE_CLASS}>
      <AffiliateCadastroStatusBanner
        statusCadastro={code?.statusCadastro}
        motivoRejeicao={code?.motivoRejeicao}
        permiteCorrecaoCadastro={code?.permiteCorrecaoCadastro}
      />

      {cadastroRejeitadoComCorrecao ? <AffiliateCadastroResubmitSection /> : null}

      <AffiliatePageHeader title="Link do Afiliado" />

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>
            {(codeError || statsError)?.message || 'Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      {cadastroAprovado && toolStatus && !toolStatus.hasActiveAccess ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Quer usar a ferramenta Disparo Rápido?</AlertTitle>
          <AlertDescription>
            Afiliados precisam de assinatura da extensão para acessar leads e campanhas.{' '}
            <Link to="/app/afiliados/assinatura-ferramenta" className="font-medium underline underline-offset-4">
              Assinar Disparo Rápido
            </Link>{' '}
            na mesma conta, sem perder o programa de indicações.
          </AlertDescription>
        </Alert>
      ) : null}

      {cadastroAprovado &&
        statistics?.tipoPlano === 'MENSALIDADE' &&
        statistics?.statusAssinatura === 'INADIMPLENTE' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Mensalidade do programa de afiliados em atraso</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {statistics.modoRepasse === 'MANUAL_NF'
                  ? 'Regularize o pagamento para manter o programa de indicações ativo.'
                  : 'Regularize o pagamento para voltar a receber comissões nos indicadores com split Asaas.'}
              </span>
              {statistics.mensalidadePagamentoUrl ? (
                <a
                  href={statistics.mensalidadePagamentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4 shrink-0"
                >
                  Abrir link de pagamento
                </a>
              ) : null}
            </AlertDescription>
          </Alert>
        )}

      {cadastroAprovado ? (
        <ShareLinkCard link={code?.linkIndicacao} fallbackCode={code?.codigoAfiliado} isLoading={loadingCode} />
      ) : null}
    </div>
  );
}
