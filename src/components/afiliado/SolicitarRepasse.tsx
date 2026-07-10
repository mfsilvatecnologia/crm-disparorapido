/**
 * Solicitação de repasse manual (NF em PDF/XML) para um período fixo (YYYY-MM).
 */

import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/utils/utils';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { affiliateKeys } from '@/features/affiliates/hooks/queryKeys';
import {
  disparoBrand,
  formatMoneyCentavos,
  formatPeriodoReferenciaCurto,
} from '@/features/affiliates/utils/repasseStatus';

export interface SolicitarRepasseProps {
  affiliateId: string;
  periodoReferencia: string;
  valorCentavos: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SolicitarRepasse: React.FC<SolicitarRepasseProps> = ({
  affiliateId,
  periodoReferencia,
  valorCentavos,
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);

  const podeEnviar = valorCentavos > 0;

  useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

  const solicitMutation = useMutation({
    mutationFn: () =>
      affiliatesApi.solicitAffiliateRepasseWithNf({
        afiliadoId: affiliateId,
        periodoReferencia,
        file: file!,
      }),
    onSuccess: async () => {
      toast({
        title: 'NF enviada com sucesso',
        description: 'Sua solicitação entrou na fila de análise. Acompanhe o status na lista de meses.',
      });
      setFile(null);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: affiliateKeys.statistics() });
      await queryClient.invalidateQueries({ queryKey: affiliateKeys.repasses(affiliateId) });
    },
    onError: (err: unknown) => {
      toast({
        title: 'Não foi possível enviar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}$/.test(periodoReferencia)) {
      toast({
        title: 'Período inválido',
        description: 'O período de referência não está disponível.',
        variant: 'destructive',
      });
      return;
    }
    if (!file) {
      toast({
        title: 'Anexe a nota fiscal',
        description: 'Envie o arquivo em PDF ou XML.',
        variant: 'destructive',
      });
      return;
    }
    solicitMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className={cn('h-5 w-5', disparoBrand.icon)} />
            Enviar nota fiscal
          </DialogTitle>
          <DialogDescription>
            Período de referência: <strong>{formatPeriodoReferenciaCurto(periodoReferencia)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Valor do período</span>
          <span className="text-xl font-bold text-slate-900">{formatMoneyCentavos(valorCentavos)}</span>
        </div>

        {!podeEnviar ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Não há saldo disponível para este período.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Arquivo da nota fiscal</Label>
              <label
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
                  solicitMutation.isPending
                    ? 'opacity-50 cursor-not-allowed border-slate-200'
                    : file
                      ? disparoBrand.uploadActive
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-slate-700">
                  {file ? file.name : 'Clique para anexar PDF ou XML'}
                </span>
                <span className="text-xs text-muted-foreground">Dados fiscais devem coincidir com seu cadastro</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.xml,application/pdf,text/xml,application/xml"
                  disabled={solicitMutation.isPending}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={solicitMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={!file || solicitMutation.isPending} className={disparoBrand.btn}>
                {solicitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  'Enviar solicitação'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SolicitarRepasse;
