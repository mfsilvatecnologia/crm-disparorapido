import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Button } from '@/shared/components/ui/button';
import {
  Play,
  Pause,
  Settings,
  Eye,
  TrendingUp,
  Clock,
  Target,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft' | 'error';
  leadsGenerated: number;
  targetLeads: number;
  qualityScore: number;
  invested: number;
  budget: number;
  progress: number;
  remainingDays: number;
  totalDays: number;
  createdAt: Date;
  lastActivity?: Date;
  segment: string;
  source: string;
  conversionRate?: number;
  estimatedCompletion?: Date;
}

interface CampaignsWidgetProps {
  campaigns: Campaign[];
  onViewCampaign: (campaignId: string) => void;
  onPauseCampaign: (campaignId: string) => void;
  onResumeCampaign: (campaignId: string) => void;
  onEditCampaign: (campaignId: string) => void;
  onCreateNew: () => void;
  className?: string;
}

export function CampaignsWidget({
  campaigns,
  onViewCampaign,
  onPauseCampaign,
  onResumeCampaign,
  onEditCampaign,
  onCreateNew,
  className = ''
}: CampaignsWidgetProps) {
  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.draft;
  };

  const getStatusLabel = (status: Campaign['status']) => {
    const labels = {
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      draft: 'Rascunho',
      error: 'Erro'
    };
    return labels[status] || 'Desconhecido';
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <Play className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'error':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalInvested = campaigns.reduce((sum, c) => sum + c.invested, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leadsGenerated, 0);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Campanhas Ativas</CardTitle>
            <CardDescription>
              {activeCampaigns.length} de {campaigns.length} campanhas em execução
            </CardDescription>
          </div>
          <Button onClick={onCreateNew} size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{totalLeads.toLocaleString('pt-BR')}</div>
            <div className="text-sm text-gray-600">Total de Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalInvested)}</div>
            <div className="text-sm text-gray-600">Investido</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalBudget > 0 ? Math.round((totalInvested / totalBudget) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Execução</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-500 mb-4">
              Crie sua primeira campanha para começar a gerar leads qualificados.
            </p>
            <Button onClick={onCreateNew}>
              <Zap className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-6 pt-0">
            {campaigns.slice(0, 4).map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1">{getStatusLabel(campaign.status)}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{campaign.segment} • {campaign.source}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewCampaign(campaign.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditCampaign(campaign.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {campaign.status === 'active' ? (
                        <DropdownMenuItem onClick={() => onPauseCampaign(campaign.id)}>
                          <Pause className="mr-2 h-4 w-4" />
                          Pausar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onResumeCampaign(campaign.id)}>
                          <Play className="mr-2 h-4 w-4" />
                          Retomar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress and Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">Leads</div>
                    <div className="font-semibold">
                      {campaign.leadsGenerated.toLocaleString('pt-BR')} / {campaign.targetLeads.toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Qualidade</div>
                    <div className="font-semibold text-green-600">{campaign.qualityScore}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Investido</div>
                    <div className="font-semibold">{formatCurrency(campaign.invested)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tempo</div>
                    <div className="font-semibold">
                      {campaign.remainingDays} dias restantes
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">{campaign.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(campaign.progress)}`}
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {campaign.lastActivity && (
                      <span>
                        Última atividade: {campaign.lastActivity.toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCampaign(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {campaign.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPauseCampaign(campaign.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pausar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {campaigns.length > 4 && (
              <div className="text-center pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => console.log('Ver todas')}>
                  Ver todas as {campaigns.length} campanhas
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
