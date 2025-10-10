import React from 'react'
import type { StageMetrics } from '../../types/metrics.types'

type Props = { metric: StageMetrics }

export function StageMetricCard({ metric }: Props) {
  return (
    <div className="rounded border p-3" style={{ borderColor: metric.cor }}>
      <div className="text-sm font-medium" style={{ color: metric.cor }}>{metric.stageName}</div>
      <div className="text-2xl font-semibold mt-1">{metric.leadCount}</div>
      <div className="text-xs text-muted-foreground mt-1">{metric.percentageOfTotal}% do total</div>
      {metric.conversionFromPrevious != null && (
        <div className="text-xs mt-1">Conversão anterior: {metric.conversionFromPrevious}%</div>
      )}
      {metric.averageDurationHours != null && (
        <div className="text-xs mt-1">Tempo médio: {metric.averageDurationHours}h</div>
      )}
    </div>
  )
}

export default StageMetricCard

