import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { ArrowLeft, Settings, Users } from 'lucide-react'
import { CampaignContactsManager } from '../components/CampaignContactsManager'
import { useCampaign } from '../hooks/useCampaigns'

export default function CampaignDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: campaign, isLoading, error } = useCampaign(id || '')

  if (!id) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-600">ID da campanha não encontrado</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Carregando campanha...</p>
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-red-600">
            Erro ao carregar campanha: {error?.message || 'Campanha não encontrada'}
          </p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Rascunho',
      scheduled: 'Agendada',
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      cancelled: 'Cancelada',
    }
    return labels[status] || status
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.nome}</h1>
            <p className="text-gray-600">{campaign.descricao}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(campaign.status)}>
            {getStatusLabel(campaign.status)}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Informações da campanha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-500">
              0 processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0.0%
            </div>
            <p className="text-xs text-gray-500">
              0 leads gerados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              0.0x
            </div>
            <p className="text-xs text-gray-500">
              R$ 0 em vendas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de contatos */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Gerenciamento de Contatos</h2>
        </div>
        <CampaignContactsManager campaignId={id} />
      </div>
    </div>
  )
}