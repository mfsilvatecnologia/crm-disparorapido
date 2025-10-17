import React from 'react'
import { useCampaignCharges } from '../../hooks/useCharges'
import type { CampaignLeadStage } from '../../types/stage.types'
import { formatCentavosToReais } from '../../utils/formatters'

type Props = {
  campaignId: string
  stages: CampaignLeadStage[]
}

export function ChargeAuditTable({ campaignId, stages }: Props) {
  const [filters, setFilters] = React.useState<{ startDate?: string; endDate?: string; stageId?: string; foiCobrado?: string }>({})
  const { data, isLoading } = useCampaignCharges(campaignId, {
    ...filters,
    foiCobrado: filters.foiCobrado === undefined ? undefined : filters.foiCobrado === 'true'
  })

  return (
    <div className="border rounded p-3">
      <div className="font-medium mb-2">Auditoria de Cobranças</div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-3">
        <input type="date" className="border rounded px-2 py-1" value={filters.startDate || ''} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
        <input type="date" className="border rounded px-2 py-1" value={filters.endDate || ''} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
        <select className="border rounded px-2 py-1" value={filters.stageId || ''} onChange={(e) => setFilters({ ...filters, stageId: e.target.value || undefined })}>
          <option value="">Todos estágios</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
        <select className="border rounded px-2 py-1" value={filters.foiCobrado || ''} onChange={(e) => setFilters({ ...filters, foiCobrado: e.target.value || undefined })}>
          <option value="">Todas</option>
          <option value="true">Sucesso</option>
          <option value="false">Falha</option>
        </select>
        <button className="border rounded px-2 py-1" onClick={() => setFilters({})}>Limpar</button>
      </div>
      {isLoading ? (
        <div>Carregando cobranças...</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-2">Lead</th>
                <th className="text-left p-2">Estágio</th>
                <th className="text-left p-2">Valor</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Erro</th>
                <th className="text-left p-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {(data || []).map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.campaignContactId}</td>
                  <td className="p-2">{c.stageName || c.stageId}</td>
                  <td className="p-2">{formatCentavosToReais(c.custoCentavos)}</td>
                  <td className="p-2">{c.foiCobrado ? 'Sucesso' : 'Falha'}</td>
                  <td className="p-2">{c.erroCobranca || '—'}</td>
                  <td className="p-2">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ChargeAuditTable

