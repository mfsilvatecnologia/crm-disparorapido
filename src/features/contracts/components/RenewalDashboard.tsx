import React from 'react';
import { useNearRenewal } from '../api/contracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatDate, formatCurrency } from '@/shared/lib/crm/formatters';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function RenewalDashboard() {
  const { data: contracts = [], isLoading, isError, error } = useNearRenewal();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Renovacoes proximas (90 dias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={`renewal-skeleton-${item}`} className="rounded-md border p-3 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar renovacoes: {(error as Error)?.message}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Renovacoes proximas (90 dias)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma renovacao pendente.</p>
          ) : (
            contracts.map((contract) => (
              <div key={contract.id} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">#{contract.numero}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {contract.servicos}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(contract.dataInicio)} - {formatDate(contract.dataFim)}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {contract.daysUntilRenewal} dias para renovar
                </div>
                <div className="text-sm font-semibold">{formatCurrency(contract.valor, { currency: contract.moeda || 'BRL' })}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
