import React, { useState } from 'react';
import { startInvestigation } from '../services/investigationApi';
import { useInvestigation } from '../hooks/useInvestigation';
import { InvestigationDashboard } from '../components/InvestigationDashboard';

export interface InvestigationPageProps {
  dossierId: string;
  estimatedCost?: number;
  estimatedDurationSec?: number;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  dossierId,
  estimatedCost,
  estimatedDurationSec,
}) => {
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const { data, loading, error, start, stop } = useInvestigation(investigationId);

  const onStart = async () => {
    const confirmMsg = `Confirmar investigação?\nCusto: R$ ${(
      estimatedCost ?? 0
    ).toFixed(2)} | Tempo estimado: ${(estimatedDurationSec ?? 0)}s`;
    const ok = window.confirm(confirmMsg);
    if (!ok) return;
    const inv = await startInvestigation(dossierId);
    setInvestigationId(inv.id);
    await start();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Investigação de Mídia Negativa</h2>

      <div>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300"
          disabled={loading}
          onClick={onStart}
        >
          {loading ? 'Processando...' : 'Iniciar Investigação'}
        </button>
        {investigationId && (
          <button className="ml-2 px-3 py-2 rounded border" onClick={stop}>
            Parar Polling
          </button>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">Erro: {error}</div>}
      {data && (
        <>
          <div className="text-sm">
            Status: <strong>{data.status}</strong>
          </div>
          <InvestigationDashboard investigation={data} />
        </>
      )}
    </div>
  );
};
