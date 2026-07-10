/**
 * Lista mensal de saldos elegíveis para repasse (uma NF por período).
 */

import React, { useMemo, useState } from 'react';
import { ChevronDown, ExternalLink, FileText, Loader2, Receipt } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { useAffiliateRepasses } from '@/features/affiliates/hooks/useAffiliateRepasses';
import type { AffiliateSaldoPorMes } from '@/features/affiliates/types';
import { SolicitarRepasse } from '@/components/afiliado/SolicitarRepasse';
import { AffiliateRepasseMonthDetailContent } from '@/features/affiliates/components/AffiliateRepasseMonthDetailContent';
import {
  disparoBrand,
  formatMoneyCentavos,
  formatPeriodoReferenciaCurto,
  isRepasseStatusBloqueado,
  RepasseStatusBadge,
  resolveMotivoAdminRepasse,
} from '@/features/affiliates/utils/repasseStatus';

export interface AffiliateRepasseMonthListProps {
  affiliateId: string;
  saldosPorMes: AffiliateSaldoPorMes[];
  loading?: boolean;
}

export function AffiliateRepasseMonthList({
  affiliateId,
  saldosPorMes,
  loading = false,
}: AffiliateRepasseMonthListProps) {
  const [selectedMonth, setSelectedMonth] = useState<AffiliateSaldoPorMes | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pixUrlLoadingId, setPixUrlLoadingId] = useState<string | null>(null);
  const [expandedPeriodo, setExpandedPeriodo] = useState<string | null>(null);

  const { data: repasses = [] } = useAffiliateRepasses(affiliateId);

  const repasseById = useMemo(() => {
    const map = new Map<string, (typeof repasses)[number]>();
    for (const repasse of repasses) {
      map.set(repasse.id, repasse);
    }
    return map;
  }, [repasses]);

  const openUploadDialog = (item: AffiliateSaldoPorMes) => {
    setSelectedMonth(item);
    setDialogOpen(true);
  };

  const toggleDetail = (item: AffiliateSaldoPorMes) => {
    setExpandedPeriodo((current) =>
      current === item.periodoReferencia ? null : item.periodoReferencia
    );
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedMonth(null);
    }
  };

  const openComprovantePix = async (repasseId: string) => {
    setPixUrlLoadingId(repasseId);
    try {
      const { signedUrl } = await affiliatesApi.getAffiliateRepasseComprovantePixUrl({
        afiliadoId: affiliateId,
        repasseId,
      });
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setPixUrlLoadingId(null);
    }
  };

  const renderAction = (item: AffiliateSaldoPorMes) => {
    if (item.podeEnviarNf) {
      const label =
        item.status === 'divergencia' || item.status === 'cancelado' || item.status === 'aguardando_nf'
          ? 'Reenviar Nota Fiscal'
          : 'Enviar Nota Fiscal';
      return (
        <Button type="button" size="sm" className={disparoBrand.btn} onClick={() => openUploadDialog(item)}>
          {label}
        </Button>
      );
    }

    if (item.status === 'pago' && item.repasseId) {
      const repasse = repasseById.get(item.repasseId);
      if (repasse?.comprovante_pix_object_key) {
        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={pixUrlLoadingId === item.repasseId}
            onClick={() => void openComprovantePix(item.repasseId!)}
          >
            {pixUrlLoadingId === item.repasseId ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Receipt className="h-3 w-3" />
            )}
            Comprovante
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>
        );
      }
      return <span className="text-xs text-muted-foreground">Pagamento concluído</span>;
    }

    if ((item.status === 'divergencia' || item.status === 'cancelado') && !item.podeEnviarNf) {
      return (
        <Button type="button" size="sm" variant="outline" disabled>
          Reenviar NF
        </Button>
      );
    }

    if (isRepasseStatusBloqueado(item.status)) {
      return (
        <Button type="button" size="sm" variant="outline" disabled className="gap-1.5">
          {(item.status === 'nf_enviada' || item.status === 'em_analise') && (
            <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
          )}
          Enviar Nota Fiscal
        </Button>
      );
    }

    if (item.status === 'disponivel' && !item.podeEnviarNf) {
      return (
        <span className="text-xs text-muted-foreground text-right max-w-[11rem]">
          Disponível após o fechamento do mês
        </span>
      );
    }

    return null;
  };

  const motivoObservacao = (item: AffiliateSaldoPorMes) => {
    if (
      (item.status !== 'divergencia' && item.status !== 'cancelado') ||
      !item.repasseId
    ) {
      return null;
    }
    const repasse = repasseById.get(item.repasseId);
    if (!repasse) return null;
    return resolveMotivoAdminRepasse({
      status: item.status,
      adminObservacao: repasse.admin_observacao,
      historicoStatus: repasse.historico_status,
    });
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className={`h-5 w-5 ${disparoBrand.icon}`} />
            Repasses por mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : saldosPorMes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <FileText className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium text-slate-700">Nenhum período com saldo ainda</p>
              <p className="text-xs max-w-sm">
                Quando houver comissões de indicações pagas em um mês, o período aparecerá aqui para envio da NF.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                      <TableHead className="w-[140px]">Mês/Ano</TableHead>
                      <TableHead className="w-[160px]">Valor disponível</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[180px] text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saldosPorMes.map((item) => {
                      const isExpanded = expandedPeriodo === item.periodoReferencia;
                      const motivo = motivoObservacao(item);
                      return (
                        <React.Fragment key={item.periodoReferencia}>
                          <TableRow
                            className={cn(
                              'cursor-pointer hover:bg-slate-50',
                              isExpanded && 'bg-slate-50'
                            )}
                            onClick={() => toggleDetail(item)}
                            aria-expanded={isExpanded}
                          >
                            <TableCell className="align-middle font-medium">
                              <span className="inline-flex items-center gap-1.5">
                                <ChevronDown
                                  className={cn(
                                    'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                                    isExpanded && 'rotate-180'
                                  )}
                                />
                                {formatPeriodoReferenciaCurto(item.periodoReferencia)}
                              </span>
                            </TableCell>
                            <TableCell className="align-middle tabular-nums">
                              {formatMoneyCentavos(item.valorCentavos)}
                            </TableCell>
                            <TableCell className="align-middle">
                              <RepasseStatusBadge status={item.status} />
                            </TableCell>
                            <TableCell
                              className="align-middle text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {renderAction(item)}
                            </TableCell>
                          </TableRow>
                          {motivo ? (
                            <TableRow className="border-0 hover:bg-transparent">
                              <TableCell colSpan={4} className="bg-red-50/70 px-4 py-2.5">
                                <p className="pl-5 text-xs leading-relaxed text-red-800">
                                  <span className="font-medium">Motivo da recusa:</span> {motivo}
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : null}
                          {isExpanded ? (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={4} className="bg-slate-50/60 p-4">
                                <AffiliateRepasseMonthDetailContent
                                  periodoReferencia={item.periodoReferencia}
                                  enabled={isExpanded}
                                />
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <ul className="space-y-3 md:hidden">
                {saldosPorMes.map((item) => {
                  const isExpanded = expandedPeriodo === item.periodoReferencia;
                  const motivo = motivoObservacao(item);
                  return (
                    <li
                      key={item.periodoReferencia}
                      className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleDetail(item)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div className="min-w-0">
                          <p className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                            <ChevronDown
                              className={cn(
                                'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                                isExpanded && 'rotate-180'
                              )}
                            />
                            {formatPeriodoReferenciaCurto(item.periodoReferencia)}
                          </p>
                          <p className="mt-0.5 pl-5 text-xs tabular-nums text-muted-foreground">
                            {formatMoneyCentavos(item.valorCentavos)}
                          </p>
                        </div>
                        <RepasseStatusBadge status={item.status} />
                      </button>

                      {motivo ? (
                        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-800">
                          <span className="font-medium">Motivo da recusa:</span> {motivo}
                        </p>
                      ) : null}

                      {isExpanded ? (
                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <AffiliateRepasseMonthDetailContent
                            periodoReferencia={item.periodoReferencia}
                            enabled={isExpanded}
                          />
                        </div>
                      ) : null}

                      <div className="mt-3 flex justify-end">{renderAction(item)}</div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {selectedMonth ? (
        <SolicitarRepasse
          affiliateId={affiliateId}
          periodoReferencia={selectedMonth.periodoReferencia}
          valorCentavos={selectedMonth.valorCentavos}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
        />
      ) : null}
    </>
  );
}
