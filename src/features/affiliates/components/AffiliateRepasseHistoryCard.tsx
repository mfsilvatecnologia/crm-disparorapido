/**
 * Lista de repasses manuais (NF + status) para o afiliado.
 */

import React, { useState } from 'react';
import { ExternalLink, FileText, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { useAffiliateRepasses } from '@/features/affiliates/hooks/useAffiliateRepasses';
import {
  formatMoneyCentavos,
  formatPeriodoReferencia,
  RepasseStatusBadge,
  RepasseStatusIcon,
} from '@/features/affiliates/utils/repasseStatus';

export interface AffiliateRepasseHistoryCardProps {
  affiliateId: string;
}

export function AffiliateRepasseHistoryCard({ affiliateId }: AffiliateRepasseHistoryCardProps) {
  const [pixUrlLoadingId, setPixUrlLoadingId] = useState<string | null>(null);
  const { data: list = [], isLoading: listLoading, isError } = useAffiliateRepasses(affiliateId);

  const openComprovantePix = async (repasseId: string) => {
    setPixUrlLoadingId(repasseId);
    try {
      const { signedUrl } = await affiliatesApi.getAffiliateRepasseComprovantePixUrl({
        afiliadoId: affiliateId,
        repasseId,
      });
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      /* toast global se configurado */
    } finally {
      setPixUrlLoadingId(null);
    }
  };

  const pendentes = list.filter((r) => !['pago', 'cancelado'].includes(r.status)).length;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg">Suas solicitações</CardTitle>
        {!listLoading && list.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {list.length} registro{list.length !== 1 ? 's' : ''}
            {pendentes > 0 ? ` · ${pendentes} em andamento` : ''}
          </span>
        ) : null}
      </CardHeader>
      <CardContent>
        {listLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-red-600">Não foi possível carregar suas solicitações. Tente recarregar a página.</p>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium text-slate-700">Nenhuma solicitação ainda</p>
            <p className="text-xs max-w-sm">
              Após enviar sua primeira nota fiscal, o andamento do repasse aparecerá aqui.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {list.map((repasse) => (
              <li
                key={repasse.id}
                className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <RepasseStatusIcon status={repasse.status} className="mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">{formatMoneyCentavos(repasse.valor_calculado_centavos)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatPeriodoReferencia(repasse.periodo_referencia)}
                      </p>
                    </div>
                  </div>
                  <RepasseStatusBadge status={repasse.status} />
                </div>

                {repasse.status === 'em_analise' || repasse.status === 'nf_enviada' ? (
                  <p className="mt-3 text-xs text-muted-foreground bg-slate-50 rounded-md px-2.5 py-2">
                    Sua NF está na fila. O pagamento em PIX ocorre após aprovação (até 30 dias corridos).
                  </p>
                ) : null}

                {repasse.status === 'aprovado' ? (
                  <p className="mt-3 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-md px-2.5 py-2">
                    NF aprovada. O pagamento via PIX será processado em breve.
                  </p>
                ) : null}

                {repasse.admin_observacao ? (
                  <p className="mt-3 text-xs text-muted-foreground border-l-2 border-slate-200 pl-2">
                    <span className="font-medium text-slate-600">Mensagem da equipe:</span> {repasse.admin_observacao}
                  </p>
                ) : null}

                {repasse.status === 'pago' && repasse.comprovante_pix_object_key ? (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      disabled={pixUrlLoadingId === repasse.id}
                      onClick={() => void openComprovantePix(repasse.id)}
                    >
                      {pixUrlLoadingId === repasse.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Receipt className="h-3 w-3" />
                      )}
                      Ver comprovante do pagamento
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </Button>
                  </div>
                ) : repasse.status === 'pago' ? (
                  <p className="mt-3 text-xs text-emerald-700">Pagamento concluído.</p>
                ) : null}

                {repasse.status === 'divergencia' ? (
                  <p className="mt-3 text-xs text-red-800 bg-red-50 border border-red-100 rounded-md px-2.5 py-2">
                    Há uma pendência na sua NF. Verifique a observação acima ou entre em contato com o suporte.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
