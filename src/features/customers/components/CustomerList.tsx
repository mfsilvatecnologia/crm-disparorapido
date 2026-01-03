import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers } from '../api/customers';
import type { CustomerFilters, CustomerStatus } from '../types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/EmptyState';
import { formatDate } from '@/shared/lib/crm/formatters';
import { Users } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { CUSTOMER_STATUS_LABELS } from '../lib/constants';

interface CustomerListProps {
  filters?: CustomerFilters;
}

const STATUS_BADGE_STYLES: Record<CustomerStatus, string> = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  INATIVO: 'bg-slate-100 text-slate-700',
  SUSPENSO: 'bg-amber-100 text-amber-700',
  CANCELADO: 'bg-rose-100 text-rose-700',
};

export function CustomerList({ filters }: CustomerListProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } =
    useCustomers(filters);

  const customers = useMemo(() => {
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
          <Card key={`customer-skeleton-${item}`}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-40" />
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
        Erro ao carregar clientes: {(error as Error)?.message}
      </p>
    );
  }

  if (!customers.length) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Clientes sao criados a partir das oportunidades ganhas."
      />
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">{customer.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Criado em {formatDate(customer.createdAt)}
              </p>
            </div>
            <Badge className={STATUS_BADGE_STYLES[customer.status] ?? ''}>
              {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {customer.segmento ? `Segmento: ${customer.segmento}` : 'Segmento nao informado'}
            </div>
            <Button asChild variant="outline">
              <Link to={`/app/crm/customers/${customer.id}`}>Detalhes</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
      <div ref={loaderRef} className="flex h-10 items-center justify-center text-sm text-muted-foreground">
        {isFetchingNextPage ? 'Carregando mais clientes...' : hasNextPage ? 'Carregar mais' : 'Fim da lista'}
      </div>
    </div>
  );
}
