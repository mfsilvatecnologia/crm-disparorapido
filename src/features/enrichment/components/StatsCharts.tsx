import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { StatsProviderRow } from '../types/enrichment';

export interface StatsChartsProps {
  providerStats: StatsProviderRow[];
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ providerStats }) => {
  if (!providerStats || providerStats.length === 0) {
    return <div className="text-sm text-gray-600">Sem dados de estatísticas</div>;
  }

  const data = providerStats.map((p) => ({
    providerId: p.providerId,
    cost: p.totalCost,
    success: p.successRatePct,
    executions: p.executions,
  }));

  return (
    <div className="space-y-6">
      {/* Cost per Provider */}
      <div className="p-3 border rounded">
        <div className="text-sm font-semibold mb-3">Custo por Provider</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="providerId" />
            <YAxis label={{ value: 'R$', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
            <Bar dataKey="cost" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Success Rate per Provider */}
      <div className="p-3 border rounded">
        <div className="text-sm font-semibold mb-3">Taxa de Sucesso por Provider (%)</div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="providerId" />
            <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Bar dataKey="success" fill={(entry) => entry.success >= 95 ? '#10b981' : '#f59e0b'} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
