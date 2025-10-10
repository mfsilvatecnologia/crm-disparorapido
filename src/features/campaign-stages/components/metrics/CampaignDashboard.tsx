import React from 'react'
import { useParams } from 'react-router-dom'
import { useCampaignFunnelMetrics } from '../../hooks/useFunnelMetrics'
import FunnelChart from './FunnelChart'
import StageMetricCard from './StageMetricCard'
import StageMetricsTable from './StageMetricsTable'

export function CampaignDashboard() {
  const { id: campaignId } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useCampaignFunnelMetrics(campaignId || '')

  if (isLoading) return <div className="p-4">Carregando métricas...</div>
  if (isError || !data) return <div className="p-4 text-red-600">Falha ao carregar métricas</div>

  return (
    <div className="p-4 space-y-4">
      <div className="text-xl font-semibold">Métricas do Funil</div>
      <FunnelChart data={data.stages} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.stages.map((m) => (
          <StageMetricCard key={m.stageId} metric={m} />
        ))}
      </div>
      <StageMetricsTable data={data.stages} />
    </div>
  )
}

export default CampaignDashboard

