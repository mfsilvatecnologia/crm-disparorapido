/**
 * Lista de repasses manuais (NF + status) para o afiliado.
 */

import React, { useState } from 'react';
import { ChevronDown, ExternalLink, FileText, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { cn } from '@/shared/utils/utils';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { useAffiliateRepasses } from '@/features/affiliates/hooks/useAffiliateRepasses';
import {
  formatMoneyCentavos,
  formatPeriodoReferencia,
  RepasseStatusBadge,
  RepasseStatusHistoricoTimeline,
  RepasseStatusIcon,
  resolveMotivoAdminRepasse,
} from '@/features/affiliates/utils/repasseStatus';

export interface AffiliateRepasseHistoryCardProps {
  affiliateId: string;
}

function statusHint(status: string): string | null {
  if (status === 'em_analise' || status === 'nf_enviada') {
    return 'NF na fila de análise. Pagamento em PIX após aprovação (até 30 dias corridos).';
  }
  if (status === 'aprovado') {
    return 'NF aprovada. O pagamento via PIX será processado em breve.';
  }
  if (status === 'pago') {
    return 'Pagamento concluído.';
  }
  return null;
}

export function AffiliateRepasseHistoryCard({ affiliateId }: AffiliateRepasseHistoryCardProps) {
  const [pixUrlLoadingId, setPixUrlLoadingId] = useState<string | null>(null);
  const [openHistoricoId, setOpenHistoricoId] = useState<string | null>(null);
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
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
            {list.map((repasse) => {
              const motivo = resolveMotivoAdminRepasse({
                status: repasse.status,
                adminObservacao: repasse.admin_observacao,
                historicoStatus: repasse.historico_status,
              });
              const hint = statusHint(repasse.status);
              const historico = repasse.historico_status ?? [];
              const historicoOpen = openHistoricoId === repasse.id;

              return (
                <li key={repasse.id} className="bg-white px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <RepasseStatusIcon status={repasse.status} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-slate-900">
                          {formatMoneyCentavos(repasse.valor_calculado_centavos)}
                        </p>
                        <RepasseStatusBadge status={repasse.status} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {formatPeriodoReferencia(repasse.periodo_referencia)}
                      </p>
                    </div>
                  </div>

                  {repasse.status === 'divergencia' || repasse.status === 'cancelado' ? (
                    <div className="mt-3 rounded-md bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-900">
                      <p className="font-medium">
                        {repasse.status === 'divergencia' ? 'Motivo da recusa' : 'Motivo do cancelamento'}
                      </p>
                      <p className="mt-1 text-red-800/90">
                        {motivo ||
                          (repasse.status === 'divergencia'
                            ? 'Há uma pendência na sua NF. Corrija o documento e reenvie, ou fale com o suporte.'
                            : 'Esta solicitação de repasse foi cancelada.')}
                      </p>
                      {repasse.status === 'divergencia' ? (
                        <p className="mt-1.5 text-red-700/70">
                          Reenvie a NF corrigida em Repasses por mês.
                        </p>
                      ) : null}
                    </div>
                  ) : hint ? (
                    <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
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
                        Ver comprovante
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </Button>
                    </div>
                  ) : null}

                  {historico.length > 0 ? (
                    <Collapsible
                      open={historicoOpen}
                      onOpenChange={(open) => setOpenHistoricoId(open ? repasse.id : null)}
                      className="mt-3"
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                        >
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 transition-transform',
                              historicoOpen && 'rotate-180'
                            )}
                          />
                          {historicoOpen ? 'Ocultar andamento' : 'Ver andamento'}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2.5">
                        <RepasseStatusHistoricoTimeline items={historico} title="Andamento" />
                      </CollapsibleContent>
                    </Collapsible>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
