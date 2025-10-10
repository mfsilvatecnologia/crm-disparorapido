import React from 'react'
import type { StageMetrics } from '../../types/metrics.types'

type Props = { data: StageMetrics[] }

export function StageMetricsTable({ data }: Props) {
  return (
    <div className="overflow-auto border rounded">
      <table className="min-w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-2">Estágio</th>
            <th className="text-left p-2">Leads</th>
            <th className="text-left p-2">% do total</th>
            <th className="text-left p-2">Conversão</th>
            <th className="text-left p-2">Tempo médio (h)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr key={m.stageId} className="border-t">
              <td className="p-2">{m.stageName}</td>
              <td className="p-2">{m.leadCount}</td>
              <td className="p-2">{m.percentageOfTotal}%</td>
              <td className="p-2">{m.conversionFromPrevious ?? '—'}</td>
              <td className="p-2">{m.averageDurationHours ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StageMetricsTable

