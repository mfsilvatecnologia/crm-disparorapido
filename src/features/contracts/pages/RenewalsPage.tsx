import React from 'react';
import { RenewalDashboard } from '../components/RenewalDashboard';

export function RenewalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Renovacoes</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe contratos proximos de renovacao.
        </p>
      </div>
      <RenewalDashboard />
    </div>
  );
}
