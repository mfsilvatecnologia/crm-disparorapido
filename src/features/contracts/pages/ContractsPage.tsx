import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

export function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Contratos</h1>
        <p className="text-sm text-muted-foreground">
          Visualize contratos vinculados a cada cliente.
        </p>
      </div>
      <div className="rounded-lg border border-border p-6">
        <p className="text-sm text-muted-foreground">
          Selecione um cliente para gerenciar contratos.
        </p>
        <Button asChild className="mt-4">
          <Link to="/app/crm/customers">Ir para clientes</Link>
        </Button>
      </div>
    </div>
  );
}
