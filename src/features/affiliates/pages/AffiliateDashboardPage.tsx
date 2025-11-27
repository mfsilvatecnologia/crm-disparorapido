import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AffiliateCodeCard } from '../components/AffiliateCodeCard';
import { ShareLinkCard } from '../components/ShareLinkCard';
import { StatisticsCards } from '../components/StatisticsCards';
import { RecentCommissionsList } from '../components/RecentCommissionsList';
import { useAffiliateCode } from '../hooks/useAffiliateCode';
import { useAffiliateStatistics } from '../hooks/useAffiliateStatistics';

export function AffiliateDashboardPage() {
  const {
    data: code,
    isLoading: loadingCode,
    isError: isCodeError,
    error: codeError,
  } = useAffiliateCode();
  const {
    data: statistics,
    isLoading: loadingStats,
    isError: isStatsError,
    error: statsError,
  } = useAffiliateStatistics();

  const hasError = isCodeError || isStatsError;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Programa de Afiliados</h1>
        <p className="text-muted-foreground">
          Compartilhe seu link, acompanhe suas indicações e visualize suas comissões em tempo real.
        </p>
      </div>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Não foi possível carregar os dados</AlertTitle>
          <AlertDescription>
            {(codeError || statsError)?.message || 'Tente novamente em instantes.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <AffiliateCodeCard code={code} isLoading={loadingCode} />
        <ShareLinkCard link={code?.linkIndicacao} fallbackCode={code?.codigoAfiliado} isLoading={loadingCode} />
      </div>

      <StatisticsCards statistics={statistics} isLoading={loadingStats} />

      <RecentCommissionsList commissions={statistics?.ultimasComissoes} isLoading={loadingStats} />
    </div>
  );
}
