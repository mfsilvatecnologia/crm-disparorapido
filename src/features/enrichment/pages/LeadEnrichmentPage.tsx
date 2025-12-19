import React, { useMemo, useState } from 'react';
import type { Provider } from '../types/enrichment';
import { ProviderSelector } from '../components/ProviderSelector';
import { EnrichmentCostCard } from '../components/EnrichmentCostCard';
import { startEnrichment } from '../services/enrichmentApi';
import { useEnrichmentJob } from '../hooks/useEnrichmentJob';
import { EnrichmentNotifications } from '../components/EnrichmentNotifications';

export interface LeadEnrichmentPageProps {
  leadId: string;
  providers: Provider[]; // simplificado: receber providers como prop por enquanto
  availableBalance?: number;
}

export const LeadEnrichmentPage: React.FC<LeadEnrichmentPageProps> = ({
  leadId,
  providers,
  availableBalance,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const { job, loading, error, start, stop } = useEnrichmentJob(jobId);

  const estimatedCost = useMemo(() => {
    return providers
      .filter((p) => p.enabled && selectedIds.includes(p.id))
      .reduce((sum, p) => sum + (p.costPerRequest ?? 0), 0);
  }, [providers, selectedIds]);

  const canSubmit = selectedIds.length > 0 &&
    (typeof availableBalance !== 'number' || estimatedCost <= availableBalance);

  const onStart = async () => {
    if (!canSubmit) return;
    const job = await startEnrichment(leadId, selectedIds);
    setJobId(job.id);
    await start();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Enriquecer Lead</h2>
      <ProviderSelector
        providers={providers}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        availableBalance={availableBalance}
      />

      <EnrichmentCostCard selectedCount={selectedIds.length} estimatedCost={estimatedCost} />

      <div>
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white disabled:bg-gray-300"
          disabled={!canSubmit || loading}
          onClick={onStart}
        >
          {loading ? 'Processando...' : 'Iniciar Enriquecimento'}
        </button>
        {jobId && (
          <button className="ml-2 px-3 py-2 rounded border" onClick={stop}>
            Parar Polling
          </button>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">Erro: {error}</div>}
      {job && (
        <div className="text-sm">
          Status do job: <strong>{job.status}</strong>
        </div>
      )}

      <EnrichmentNotifications job={job} />
    </div>
  );
};
