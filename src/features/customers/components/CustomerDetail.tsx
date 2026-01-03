import React from 'react';
import type { Customer } from '../types/customer';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatDate } from '@/shared/lib/crm/formatters';
import { HealthScoreBadge } from './HealthScoreBadge';
import { CUSTOMER_STATUS_LABELS } from '../lib/constants';

interface CustomerDetailProps {
  customer: Customer;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{customer.nome}</CardTitle>
          <Badge variant="outline">{CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}</Badge>
          {customer.healthScore !== null ? (
            <HealthScoreBadge score={customer.healthScore} />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Atualizado em {formatDate(customer.updatedAt, { includeTime: true })}
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Segmento</p>
          <p className="text-sm">{customer.segmento ?? 'Nao informado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">CNPJ</p>
          <p className="text-sm">{customer.cnpj ?? 'Nao informado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm">{customer.email ?? 'Nao informado'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Telefone</p>
          <p className="text-sm">{customer.telefone ?? 'Nao informado'}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-muted-foreground">Endereco</p>
          <p className="text-sm">{customer.endereco ?? 'Nao informado'}</p>
        </div>
        {customer.notas ? (
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground">Notas</p>
            <p className="text-sm">{customer.notas}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
