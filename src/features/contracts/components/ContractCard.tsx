import React from 'react';
import type { Contract } from '../types/contract';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency, formatDate } from '@/shared/lib/crm/formatters';
import { CONTRACT_STATUS_LABELS } from '../lib/constants';

interface ContractCardProps {
  contract: Contract;
  onEdit?: (contract: Contract) => void;
  onRenew?: (contract: Contract) => void;
}

export function ContractCard({ contract, onEdit, onRenew }: ContractCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">#{contract.numero}</p>
            <Badge variant="outline">{CONTRACT_STATUS_LABELS[contract.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(contract.dataInicio)} - {formatDate(contract.dataFim)}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {contract.servicos}
          </p>
          <p className="text-sm font-semibold">{formatCurrency(contract.valor, { currency: contract.moeda || 'BRL' })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={() => onEdit(contract)}>
              Editar
            </Button>
          ) : null}
          {onRenew ? (
            <Button variant="outline" size="sm" onClick={() => onRenew(contract)}>
              Renovar
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
