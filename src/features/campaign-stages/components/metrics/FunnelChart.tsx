import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { StageMetrics } from '../../types/metrics.types'

type Props = { data: StageMetrics[] }

export function FunnelChart({ data }: Props) {
  const chartData = data.map((d) => ({ name: d.stageName, value: d.leadCount, color: d.cor }))
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip formatter={(v: any) => [v, 'Leads']} />
          <Bar dataKey="value" isAnimationActive radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FunnelChart
