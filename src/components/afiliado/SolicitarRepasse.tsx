/**
 * Solicitação de repasse manual (NF em PDF/XML + período YYYY-MM).
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { cn } from '@/shared/utils/utils';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';
import { affiliateKeys } from '@/features/affiliates/hooks/queryKeys';
import { disparoBrand, formatMoneyCentavos } from '@/features/affiliates/utils/repasseStatus';

export interface SolicitarRepasseProps {
  affiliateId: string;
  saldoDisponivelCentavos: number;
}

export const SolicitarRepasse: React.FC<SolicitarRepasseProps> = ({
  affiliateId,
  saldoDisponivelCentavos,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [periodo, setPeriodo] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });
  const [file, setFile] = useState<File | null>(null);

  const podeEnviar = saldoDisponivelCentavos > 0;

  const solicitMutation = useMutation({
    mutationFn: () =>
      affiliatesApi.solicitAffiliateRepasseWithNf({
        afiliadoId: affiliateId,
        periodoReferencia: periodo,
        file: file!,
      }),
    onSuccess: async () => {
      toast({
        title: 'NF enviada com sucesso',
        description: 'Sua solicitação entrou na fila de análise. Acompanhe o status abaixo.',
      });
      setFile(null);
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
    if (!/^\d{4}-\d{2}$/.test(periodo)) {
      toast({
        title: 'Período inválido',
        description: 'Selecione o mês de referência da nota fiscal.',
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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className={cn('h-5 w-5', disparoBrand.icon)} />
          Enviar nota fiscal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-slate-50/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Saldo disponível para repasse</span>
          <span className="text-xl font-bold text-slate-900">{formatMoneyCentavos(saldoDisponivelCentavos)}</span>
        </div>

        {!podeEnviar ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            No momento não há saldo disponível para nova solicitação. Quando houver comissões liberadas, você poderá
            enviar a NF aqui.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="periodo_repasse">Mês de referência da NF</Label>
            <Input
              id="periodo_repasse"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              required
              disabled={!podeEnviar || solicitMutation.isPending}
              className="max-w-xs"
            />
          </div>

          <div className="space-y-2">
            <Label>Arquivo da nota fiscal</Label>
            <label
              className={cn(
                'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
                !podeEnviar || solicitMutation.isPending
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
                disabled={!podeEnviar || solicitMutation.isPending}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <Button type="submit" disabled={!podeEnviar || !file || solicitMutation.isPending} className="w-full sm:w-auto">
            {solicitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              'Enviar solicitação de repasse'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SolicitarRepasse;
