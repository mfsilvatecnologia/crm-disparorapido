import React, { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import type { Provider, StatsOverview } from '../types/enrichment';
import { getEnrichmentStats } from '../services/statsApi';
import { StatsCharts } from '../components/StatsCharts';

export interface EnrichmentStatsPageProps {
  providers?: Provider[];
}

export const EnrichmentStatsPage: React.FC<EnrichmentStatsPageProps> = ({ providers = [] }) => {
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [startDate, setStartDate] = useState<string>(() => {
    return format(addDays(new Date(), -7), 'yyyy-MM-dd');
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM-dd');
  });
  const [providerId, setProviderId] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getEnrichmentStats({
          startDate,
          endDate,
          providerId: providerId !== 'all' ? providerId : undefined,
        });
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [startDate, endDate, providerId]);

  const totals = stats?.totals ?? {
    totalExecutions: 0,
    overallSuccessRatePct: 0,
    overallCost: 0,
    activeProviders: 0,
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dashboard de Estatísticas</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-600">Total Execuções</div>
          <div className="text-2xl font-semibold">{totals.totalExecutions}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-600">Taxa Sucesso</div>
          <div className={`text-2xl font-semibold ${totals.overallSuccessRatePct >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
            {totals.overallSuccessRatePct.toFixed(1)}%
          </div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-600">Custo Total</div>
          <div className="text-2xl font-semibold">R$ {totals.overallCost.toFixed(2)}</div>
        </div>
        <div className="p-3 border rounded bg-white">
          <div className="text-xs text-gray-600">Providers Ativos</div>
          <div className="text-2xl font-semibold">{totals.activeProviders}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold">Filtros</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-sm">Data Início</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Data Fim</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm">Provider</label>
            <select
              className="w-full border rounded p-2"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
            >
              <option value="all">Todos</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-600">Carregando...</div>}

      {stats && (
        <>
          <StatsCharts providerStats={stats.providerStats} />

          <div className="p-3 border rounded">
            <div className="text-sm font-semibold mb-2">Detalhes por Provider</div>
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-1 text-left">Provider</th>
                  <th className="p-1 text-left">Execuções</th>
                  <th className="p-1 text-left">Taxa Sucesso</th>
                  <th className="p-1 text-left">Custo Total</th>
                  <th className="p-1 text-left">Duração Média</th>
                </tr>
              </thead>
              <tbody>
                {stats.providerStats.map((p) => (
                  <tr key={p.providerId} className="border-t">
                    <td className="p-1">{p.providerId}</td>
                    <td className="p-1">{p.executions}</td>
                    <td className={`p-1 ${p.successRatePct >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                      {p.successRatePct.toFixed(1)}%
                    </td>
                    <td className="p-1">R$ {p.totalCost.toFixed(2)}</td>
                    <td className="p-1">{p.avgDurationSec.toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
