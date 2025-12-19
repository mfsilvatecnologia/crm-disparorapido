import React, { useMemo, useState } from 'react';
import type { Investigation, InvestigationSource } from '../types/enrichment';

export interface InvestigationDashboardProps {
  investigation: Investigation;
}

const Gauge: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full bg-gray-200 h-3 rounded">
      <div
        className="h-3 rounded bg-green-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const InvestigationDashboard: React.FC<InvestigationDashboardProps> = ({ investigation }) => {
  const [filterAssessment, setFilterAssessment] = useState<string>('all');

  const counts = investigation.counts ?? { positive: 0, neutral: 0, suspect: 0, negative: 0 };
  const risk = typeof investigation.riskScore === 'number' ? investigation.riskScore : 0;

  const filteredSources = useMemo(() => {
    const sources = investigation.sources ?? [];
    if (filterAssessment === 'all') return sources;
    return sources.filter((s: InvestigationSource) => s.assessment === filterAssessment);
  }, [investigation.sources, filterAssessment]);

  return (
    <div className="space-y-4">
      <div className="p-3 border rounded bg-white">
        <div className="text-sm text-gray-600">Risk score</div>
        <Gauge value={risk} />
        <div className="mt-1 text-sm">{risk}%</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-2 border rounded"><div className="text-xs">Positivo</div><div className="font-semibold">{counts.positive}</div></div>
        <div className="p-2 border rounded"><div className="text-xs">Neutro</div><div className="font-semibold">{counts.neutral}</div></div>
        <div className="p-2 border rounded"><div className="text-xs">Suspeito</div><div className="font-semibold">{counts.suspect}</div></div>
        <div className="p-2 border rounded"><div className="text-xs">Negativo</div><div className="font-semibold">{counts.negative}</div></div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Filtrar por avaliação:</label>
        <select
          className="border rounded p-1 text-sm"
          value={filterAssessment}
          onChange={(e) => setFilterAssessment(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="positive">Positivo</option>
          <option value="neutral">Neutro</option>
          <option value="suspect">Suspeito</option>
          <option value="negative">Negativo</option>
        </select>
      </div>

      <div className="space-y-2">
        {(filteredSources ?? []).length === 0 ? (
          <div className="text-sm text-gray-600">Nenhuma fonte encontrada</div>
        ) : (
          filteredSources.map((s, idx) => (
            <div key={idx} className="p-2 border rounded">
              <div className="text-sm font-semibold">{s.title}</div>
              <div className="text-xs text-gray-600">{s.url}</div>
              <div className="text-xs">Avaliação: {s.assessment} | Confiança: {s.confidence} | Impacto: {s.impact}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
