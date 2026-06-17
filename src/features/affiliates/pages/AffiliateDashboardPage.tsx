import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { ShareLinkCard } from '../components/ShareLinkCard';
import {
  AffiliateCadastroStatusBanner,
  isAffiliateCadastroApproved,
} from '../components/AffiliateCadastroStatusBanner';
import { useAffiliateCode } from '../hooks/useAffiliateCode';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Link do Afiliado</h1>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>
            {(codeError || statsError)?.message || 'Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      <AffiliateCadastroStatusBanner
        statusCadastro={code?.statusCadastro}
        motivoRejeicao={code?.motivoRejeicao}
      />

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
