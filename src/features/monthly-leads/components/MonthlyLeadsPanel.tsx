import { useCallback, useEffect, useMemo, useState } from 'react';
import { monthlyLeadsApi } from '../services/monthlyLeadsApi';
import type { ClaimResult, LeadAllocationCycle, LeadDeliveryHistoryItem, LeadPreference } from '../types/monthlyLeads.types';
import {
  formatLeadCount,
  getAvailability,
  getSegmentsForState,
  getStatesForSegment,
  type CatalogState,
} from '../utils/catalogUtils';
import { MonthlyDeliveredLeadsSection } from './MonthlyDeliveredLeadsSection';

export function MonthlyLeadsPanel() {
  const [cycle, setCycle] = useState<LeadAllocationCycle | null>(null);
  const [preference, setPreference] = useState<LeadPreference | null>(null);
  const [catalog, setCatalog] = useState<CatalogState[]>([]);
  const [history, setHistory] = useState<LeadDeliveryHistoryItem[]>([]);
  const [estado, setEstado] = useState('');
  const [segmento, setSegmento] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastClaim, setLastClaim] = useState<ClaimResult | null>(null);
  const [deliveredRefreshKey, setDeliveredRefreshKey] = useState(0);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cycleData, preferenceData, historyData, catalogData] = await Promise.all([
        monthlyLeadsApi.getCycle(),
        monthlyLeadsApi.getPreference(),
        monthlyLeadsApi.getHistory(),
        monthlyLeadsApi.getCatalog(),
      ]);
      setCycle(cycleData);
      setPreference(preferenceData);
      setHistory(historyData);
      setCatalog(catalogData.states ?? []);

      if (preferenceData) {
        setEstado(preferenceData.estado);
        setSegmento(preferenceData.segmento);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads mensais');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const availableStates = useMemo(() => getStatesForSegment(catalog, segmento), [catalog, segmento]);

  const availableSegments = useMemo(() => getSegmentsForState(catalog, estado), [catalog, estado]);

  const selectedAvailability = useMemo(
    () => getAvailability(catalog, estado, segmento),
    [catalog, estado, segmento]
  );

  const handleEstadoChange = (value: string) => {
    setEstado(value);
    setMessage(null);

    if (value && segmento) {
      const segments = getSegmentsForState(catalog, value);
      if (!segments.some((item) => item.segment === segmento)) {
        setSegmento('');
      }
    }
  };

  const handleSegmentoChange = (value: string) => {
    setSegmento(value);
    setMessage(null);

    if (value && estado) {
      const states = getStatesForSegment(catalog, value);
      if (!states.some((item) => item.state === estado)) {
        setEstado('');
      }
    }
  };

  const handleSaveAndClaim = async () => {
    if (!estado || !segmento) {
      setError('Selecione UF e segmento');
      return;
    }
    if (!cycle || cycle.quotaRemaining <= 0) {
      setError('Cota mensal de leads esgotada');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);
    setLastClaim(null);

    try {
      const saved = await monthlyLeadsApi.savePreference(estado, segmento);
      setPreference(saved);

      const result = await monthlyLeadsApi.claim();
      setLastClaim(result);

      const [cycleData, historyData] = await Promise.all([
        monthlyLeadsApi.getCycle(),
        monthlyLeadsApi.getHistory(),
      ]);
      setCycle(cycleData);
      setHistory(historyData);
      setSelectedRequestId(result.requestId);
      setDeliveredRefreshKey((value) => value + 1);
      setMessage(
        result.partial
          ? `Preferência salva. Entrega parcial: ${result.delivered} de ${result.requested} leads importados.`
          : `Preferência salva. ${result.delivered} leads importados com sucesso para o CRM.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferência e receber leads');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">Carregando catálogo e leads mensais...</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">Geração de Leads - Lead Rápido</h2>
        <p className="mt-1 text-sm text-gray-600">
          Todos os meses você recebe uma cota de leads gratuito. Caso precise de mais leads, você pode adquirí-los por R$ 0,01 cada direto no site da{' '}
          <a
            href="https://leadrapido.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900"
          >
            LeadRapido.com.br
          </a>
          .
        </p>
      </div>

      <div className="space-y-6 p-6">
        {cycle && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Cota total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{cycle.quotaTotal}</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Utilizados</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{cycle.quotaUsed}</p>
            </div>
            <div className="rounded-md bg-blue-50 p-4">
              <p className="text-xs font-medium uppercase text-blue-700">Disponíveis</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{cycle.quotaRemaining}</p>
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">Período</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {new Date(cycle.periodStart).toLocaleDateString('pt-BR')} — {new Date(cycle.periodEnd).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {catalog.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Nenhuma combinação UF/segmento disponível no catálogo no momento. Tente novamente mais tarde.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="monthly-leads-estado" className="mb-1 block text-sm font-medium text-gray-700">
                  Estado (UF)
                </label>
                <select
                  id="monthly-leads-estado"
                  value={estado}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Selecione a UF</option>
                  {availableStates.map((entry) => (
                    <option key={entry.state} value={entry.state}>
                      {entry.state}
                    </option>
                  ))}
                </select>
                {segmento && !estado && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mostrando apenas UFs com o segmento &quot;{segmento}&quot; em estoque.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="monthly-leads-segmento" className="mb-1 block text-sm font-medium text-gray-700">
                  Segmento
                </label>
                <select
                  id="monthly-leads-segmento"
                  value={segmento}
                  onChange={(e) => handleSegmentoChange(e.target.value)}
                  disabled={availableSegments.length === 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
                >
                  <option value="">Selecione o segmento</option>
                  {availableSegments.map((item) => (
                    <option key={item.segment} value={item.segment}>
                      {item.segment}
                    </option>
                  ))}
                </select>
                {estado && !segmento && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mostrando segmentos disponíveis em {estado}.
                  </p>
                )}
              </div>
            </div>

            {selectedAvailability !== null && (
              <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                <span className="font-medium">{formatLeadCount(selectedAvailability)} leads</span> disponíveis no catálogo
                para <span className="font-medium">{segmento}</span> em <span className="font-medium">{estado}</span>.
                Sua cota mensal pode limitar a quantidade entregue.
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSaveAndClaim()}
            disabled={
              submitting ||
              !estado ||
              !segmento ||
              catalog.length === 0 ||
              !cycle ||
              cycle.quotaRemaining <= 0
            }
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Salvando e importando leads...' : 'Receber leads do mês'}
          </button>
        </div>

        {message && <p className="text-sm text-green-700">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {lastClaim && (
          <p className="text-sm text-gray-600">
            Última entrega: {lastClaim.delivered} leads ({lastClaim.importedCount} importados no CRM).
          </p>
        )}

        <MonthlyDeliveredLeadsSection
          refreshKey={deliveredRefreshKey}
          selectedRequestId={selectedRequestId}
        />

        {history.length > 0 && (
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Histórico recente</h3>
              {selectedRequestId && (
                <button
                  type="button"
                  onClick={() => setSelectedRequestId(null)}
                  className="text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  Ver todos os leads entregues
                </button>
              )}
            </div>
            <p className="mb-2 text-xs text-gray-500">Clique em uma entrega para filtrar os leads acima.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="px-3 py-2">Data</th>
                    <th className="px-3 py-2">UF</th>
                    <th className="px-3 py-2">Segmento</th>
                    <th className="px-3 py-2">Entregues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedRequestId(item.id)}
                      className={`cursor-pointer ${selectedRequestId === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-3 py-2">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td className="px-3 py-2">{item.estado}</td>
                      <td className="px-3 py-2">{item.segmento}</td>
                      <td className="px-3 py-2">{item.deliveredQty}/{item.requestedQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
