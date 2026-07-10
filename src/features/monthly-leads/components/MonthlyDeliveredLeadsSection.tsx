import { useCallback, useEffect, useState } from 'react';
import { monthlyLeadsApi } from '../services/monthlyLeadsApi';
import type { DeliveredLead } from '../types/monthlyLeads.types';

interface MonthlyDeliveredLeadsSectionProps {
  refreshKey?: number;
  selectedRequestId?: string | null;
}

export function MonthlyDeliveredLeadsSection({
  refreshKey = 0,
  selectedRequestId = null,
}: MonthlyDeliveredLeadsSectionProps) {
  const [leads, setLeads] = useState<DeliveredLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'leadrapido' | 'disparo' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveredLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await monthlyLeadsApi.getDeliveredLeads(
        1,
        20,
        selectedRequestId ?? undefined
      );
      setLeads(response.items);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads entregues');
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedRequestId]);

  useEffect(() => {
    void loadDeliveredLeads();
  }, [loadDeliveredLeads, refreshKey]);

  const handleExport = async (format: 'leadrapido' | 'disparo') => {
    setExporting(format);
    setError(null);
    try {
      await monthlyLeadsApi.downloadDeliveredExport(format, selectedRequestId ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar leads');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Carregando leads entregues...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        Nenhum lead entregue ainda. Após solicitar os leads do mês, eles aparecerão aqui para visualização e download.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Seus leads entregues</h3>
          <p className="mt-1 text-sm text-gray-600">
            {total} lead{total === 1 ? '' : 's'} disponíve{total === 1 ? 'l' : 'is'}
            {selectedRequestId ? ' nesta entrega' : ' no total'}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleExport('leadrapido')}
            disabled={exporting !== null}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting === 'leadrapido' ? 'Gerando...' : 'Baixar planilha Lead Rápido'}
          </button>
          <button
            type="button"
            onClick={() => void handleExport('disparo')}
            disabled={exporting !== null}
            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"
          >
            {exporting === 'disparo' ? 'Gerando...' : 'Baixar planilha Disparo Rápido'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="px-3 py-2">UF</th>
              <th className="px-3 py-2">Segmento</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">WhatsApp</th>
              <th className="px-3 py-2">Telefone</th>
              <th className="px-3 py-2">E-mail</th>
              <th className="px-3 py-2">Cidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-3 py-2">{lead.estado || '—'}</td>
                <td className="px-3 py-2">{lead.segmento || '—'}</td>
                <td className="px-3 py-2 font-medium text-gray-900">{lead.nome || '—'}</td>
                <td className="px-3 py-2">{lead.whatsapp || '—'}</td>
                <td className="px-3 py-2">{lead.telefone || '—'}</td>
                <td className="px-3 py-2">{lead.email || '—'}</td>
                <td className="px-3 py-2">{lead.cidade || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > leads.length && (
        <p className="text-xs text-gray-500">
          Mostrando {leads.length} de {total}. Use os botões de download para obter a lista completa nos formatos Lead Rápido ou Disparo Rápido.
        </p>
      )}
    </div>
  );
}
