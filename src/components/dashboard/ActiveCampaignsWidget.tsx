import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  MoreHorizontal, 
  Pause, 
  Settings, 
  Users,
  Eye
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  leadsGenerated: number;
  qualityScore: number;
  invested: number;
  progress: number;
  remainingDays: number;
  targetLeads: number;
}

interface ActiveCampaignsWidgetProps {
  campaigns: Campaign[];
  className?: string;
}

export function ActiveCampaignsWidget({ campaigns, className = '' }: ActiveCampaignsWidgetProps) {
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-500';
      case 'paused':
        return 'bg-warning-500';
      case 'completed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return '●';
      case 'paused':
        return '⏸';
      case 'completed':
        return '✓';
      default:
        return '●';
    }
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-lg ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            Campanhas Ativas ({campaigns.length})
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
          Ver Todas
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            {/* Header da Campanha */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${getStatusColor(campaign.status)}`}>
                  {getStatusIcon(campaign.status)}
                </span>
                <div>
                  <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{campaign.remainingDays} dias restantes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <span className="text-gray-500">Leads:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {campaign.leadsGenerated.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Qualidade:</span>
                <span className="ml-1 font-medium text-gray-900">
                  {campaign.qualityScore}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Investido:</span>
                <span className="ml-1 font-medium text-gray-900">
                  R$ {campaign.invested.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Progresso</span>
                <span className="font-medium text-gray-900">{campaign.progress}% completa</span>
              </div>
              <Progress value={campaign.progress} className="h-2" />
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Pause className="h-3 w-3 mr-1" />
                Pausar
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Ver Leads
              </Button>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Nenhuma campanha ativa no momento</p>
            <Button className="mt-4" size="sm">
              Criar Nova Campanha
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
