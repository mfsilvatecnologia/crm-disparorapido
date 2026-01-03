import React, { useMemo } from 'react';
import type { Opportunity } from '../types/opportunity';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/crm/formatters';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STAGE_COLORS } from '../lib/constants';

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
}

export function OpportunityPipeline({ opportunities }: OpportunityPipelineProps) {
  const stageSummary = useMemo(() => {
    const summary = new Map<string, { count: number; value: number }>();
    OPPORTUNITY_STAGES.forEach((stage) => {
      summary.set(stage, { count: 0, value: 0 });
    });

    opportunities.forEach((opportunity) => {
      const current = summary.get(opportunity.estagio) ?? { count: 0, value: 0 };
      summary.set(opportunity.estagio, {
        count: current.count + 1,
        value: current.value + opportunity.valorEstimado,
      });
    });

    return summary;
  }, [opportunities]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {OPPORTUNITY_STAGES.map((stage) => {
        const summary = stageSummary.get(stage) ?? { count: 0, value: 0 };
        return (
          <Card key={stage} className="border-dashed">
            <CardContent className="space-y-2 pt-6">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${OPPORTUNITY_STAGE_COLORS[stage]}`} />
                <p className="text-sm font-medium">{stage}</p>
              </div>
              <p className="text-xl font-semibold">{summary.count} oportunidades</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(summary.value)} estimado
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
