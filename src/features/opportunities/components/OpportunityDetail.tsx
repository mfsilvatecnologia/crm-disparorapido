import React from 'react';
import type { Opportunity } from '../types/opportunity';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/lib/crm/formatters';
import { OPPORTUNITY_STAGE_COLORS, OPPORTUNITY_STATUS_LABELS } from '../lib/constants';

interface OpportunityDetailProps {
  opportunity: Opportunity;
}

export function OpportunityDetail({ opportunity }: OpportunityDetailProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{opportunity.nome}</CardTitle>
          <Badge className={OPPORTUNITY_STAGE_COLORS[opportunity.estagio]}>
            {opportunity.estagio}
          </Badge>
          <Badge variant="outline">{OPPORTUNITY_STATUS_LABELS[opportunity.status]}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Fechamento previsto: {formatDate(opportunity.expectedCloseDate)}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Valor estimado</p>
          <p className="text-lg font-semibold">{formatCurrency(opportunity.valorEstimado)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Probabilidade</p>
          <p className="text-lg font-semibold">{opportunity.probabilidade}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Criada em</p>
          <p className="text-sm">{formatDate(opportunity.createdAt, { includeTime: true })}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Atualizada em</p>
          <p className="text-sm">{formatDate(opportunity.updatedAt, { includeTime: true })}</p>
        </div>
        {opportunity.descricao ? (
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Descricao</p>
            <p className="text-sm">{opportunity.descricao}</p>
          </div>
        ) : null}
        {opportunity.motivoPerdida ? (
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Motivo da perda</p>
            <p className="text-sm">{opportunity.motivoPerdida}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
