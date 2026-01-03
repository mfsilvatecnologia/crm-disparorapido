import React, { useEffect, useId, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CustomerList } from '../components/CustomerList';
import { useCustomerFilters } from '../hooks/useCustomerFilters';
import type { CustomerSegment, CustomerStatus } from '../types/customer';
import { CUSTOMER_SEGMENTS, CUSTOMER_STATUS_LABELS } from '../lib/constants';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => {
    const statusParam = searchParams.get('status');
    const segmentoParam = searchParams.get('segmento');

    return {
      search: searchParams.get('search') || undefined,
      status: Object.keys(CUSTOMER_STATUS_LABELS).includes(statusParam || '')
        ? (statusParam as CustomerStatus)
        : undefined,
      segmento: CUSTOMER_SEGMENTS.includes(segmentoParam as CustomerSegment)
        ? (segmentoParam as CustomerSegment)
        : undefined,
    };
  }, [searchParams]);

  const { filters, updateFilter, setFilters } = useCustomerFilters(initialFilters);
  const searchId = useId();
  const statusId = useId();
  const segmentId = useId();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.segmento) params.set('segmento', filters.segmento);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleReset = () => {
    setFilters({});
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground">Gerencie os perfis dos clientes.</p>
      </div>

      <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="text-sm font-medium" htmlFor={searchId}>
            Buscar
          </label>
          <Input
            id={searchId}
            placeholder="Buscar por nome"
            value={filters.search ?? ''}
            onChange={(event) => updateFilter('search', event.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={statusId}>
            Status
          </label>
          <Select
            value={filters.status ?? 'all'}
            onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id={statusId}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(CUSTOMER_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor={segmentId}>
            Segmento
          </label>
          <Select
            value={filters.segmento ?? 'all'}
            onValueChange={(value) => updateFilter('segmento', value === 'all' ? undefined : value)}
          >
            <SelectTrigger id={segmentId}>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {CUSTOMER_SEGMENTS.map((segment) => (
                <SelectItem key={segment} value={segment}>
                  {segment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset}>
            Limpar filtros
          </Button>
        </div>
      </div>

      <CustomerList filters={filters} />
    </div>
  );
}
