import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useOpportunities } from '../api/opportunities';
import type { OpportunityFilters } from '../types/opportunity';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatCurrency, formatDate } from '@/shared/lib/crm/formatters';
import { OPPORTUNITY_STAGE_COLORS } from '../lib/constants';
import { OpportunityPipeline } from './OpportunityPipeline';
import { HandCoins } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface OpportunityListProps {
  filters?: OpportunityFilters;
  showPipeline?: boolean;
}

export function OpportunityList({ filters, showPipeline = false }: OpportunityListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useOpportunities(filters);

  const opportunities = useMemo(() => {
    const allItems = data?.pages.flatMap((page) => page.data) ?? [];
    // Deduplicate by id to avoid React key warnings
    const seen = new Set<string>();
    return allItems.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [data]);

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!loaderRef.current || !hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      // Use ref to prevent multiple simultaneous fetches
      if (entries[0].isIntersecting && !isFetchingNextPage && !fetchingRef.current) {
        fetchingRef.current = true;
        fetchNextPage().finally(() => {
          fetchingRef.current = false;
        });
      }
    }, { threshold: 0.1 });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={`opp-skeleton-${item}`}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar oportunidades: {(error as Error)?.message}
      </p>
    );
  }

  if (!opportunities.length) {
    return (
      <EmptyState
        icon={HandCoins}
        title="Nenhuma oportunidade encontrada"
        description="Crie sua primeira oportunidade ou ajuste os filtros para ver resultados."
      />
    );
  }

  return (
    <div className="space-y-4">
      {showPipeline ? <OpportunityPipeline opportunities={opportunities} /> : null}
      {opportunities.map((opportunity) => (
        <Card key={opportunity.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{opportunity.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fechamento previsto: {formatDate(opportunity.expectedCloseDate)}
              </p>
            </div>
            <Badge className={OPPORTUNITY_STAGE_COLORS[opportunity.estagio]}>
              {opportunity.estagio}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Valor estimado</p>
              <p className="text-lg font-semibold">{formatCurrency(opportunity.valorEstimado)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Probabilidade</p>
              <p className="text-lg font-semibold">{opportunity.probabilidade}%</p>
            </div>
            <Button asChild variant="outline">
              <Link to={`/app/crm/opportunities/${opportunity.id}`}>Detalhes</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      <div ref={loaderRef} className="flex h-10 items-center justify-center text-sm text-muted-foreground">
        {isFetchingNextPage ? 'Carregando mais oportunidades...' : hasNextPage ? 'Carregar mais' : 'Fim da lista'}
      </div>
    </div>
  );
}
