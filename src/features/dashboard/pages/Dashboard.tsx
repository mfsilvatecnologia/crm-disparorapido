import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Users,
  Target,
  Activity,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { RecentLeadsWidget, UsageMonitorWidget } from '@/features/dashboard';
import {
  LeadsMetricCard,
  QualityMetricCard,
  ROIMetricCard,
  GrowthMetricCard,
  QuickActions,
  useQuickActions,
} from '@/features/dashboard';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { DashboardError } from '../components/DashboardError';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { actions } = useQuickActions();

  // Fetch real dashboard data from APIs
  const {
    stats,
    campaigns,
    recentLeads,
    usage,
    insights,
    isLoading,
    error,
  } = useDashboardData();

  // Show loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error) {
    return <DashboardError error={error} onRetry={() => window.location.reload()} />;
  }

  // Extended usage data for monitor widget
  const extendedUsage = {
    ...usage,
    plan: 'Professional', // TODO: Get from user subscription
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    maxCampaigns: 10,
    integrations: 0, // TODO: Get from real data
    maxIntegrations: 5,
    exports: 0, // TODO: Get from real data
    maxExports: 50,
    apiCalls: 0, // TODO: Get from real data
    maxApiCalls: 5000,
    estimatedDaysUntilLimit: usage.daysRemaining,
  };

  // Transform leads for widget format
  const formattedLeads = recentLeads.map((lead) => ({
    id: lead.id,
    companyName: lead.empresa,
    contactName: lead.nome,
    contactRole: 'Contato',
    email: lead.email,
    phone: lead.telefone,
    sector: 'N/A',
    location: 'N/A',
    employees: 0,
    qualityScore: lead.score,
    createdAt: new Date(lead.createdAt),
    campaign: 'N/A',
    linkedinUrl: '',
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'madrugada';
    if (hour < 12) return 'manhã';
    if (hour < 18) return 'tarde';
    return 'noite';
  };

  const getUserFirstName = () => {
    return user?.email?.split('@')[0] || 'Usuário';
  };

  // Navigation handlers
  const handleViewAllLeads = () => navigate('/app/leads');
  const handleFilterLeads = () => navigate('/app/leads?filter=true');
  const handleExportLeads = () => navigate('/app/leads?export=true');
  const handleOptimizeQuality = () => navigate('/app/leads?sort=scoreQualificacao');
  const handleViewReport = () => navigate('/app/campanhas');
  const handleAnalyzeGrowth = () => navigate('/app/campanhas');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {getGreeting()}, {getUserFirstName()}! 👋
                </h1>
                <Badge variant="outline" className="px-3 py-1">
                  {extendedUsage.plan}
                </Badge>
              </div>
              <p className="text-gray-600">
                {stats.totalLeads > 0 
                  ? `Você tem ${stats.totalLeads} leads este mês. `
                  : 'Comece a capturar leads para sua operação. '}
                {extendedUsage.daysRemaining} dias restantes no ciclo.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar
              </Button>
            </div>
          </div>

          {/* Main Metrics Grid - Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LeadsMetricCard
              total={stats.totalLeads}
              change={stats.monthGrowth}
              breakdown={stats.leadsBreakdown}
              onViewAll={handleViewAllLeads}
              onFilter={handleFilterLeads}
              onExport={handleExportLeads}
            />

            <QualityMetricCard
              average={stats.qualityAverage}
              distribution={stats.qualityDistribution}
              trend={stats.qualityAverage >= 70 ? 'up' : stats.qualityAverage >= 50 ? 'stable' : 'down'}
              onOptimize={handleOptimizeQuality}
            />

            <GrowthMetricCard
              percentage={stats.monthGrowth}
              trend={stats.monthGrowth > 0 ? 'up' : stats.monthGrowth < 0 ? 'down' : 'stable'}
              onAnalyze={handleAnalyzeGrowth}
            />

            <ROIMetricCard
              value={stats.estimatedROI}
              period="Este mês"
              projection={stats.estimatedROI * 1.1}
              onViewReport={handleViewReport}
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <QuickActions actions={actions} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Campaigns & Leads */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Campaigns - Real Data */}
            {campaigns.length > 0 ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary-600" />
                      Campanhas Ativas
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => navigate('/app/campanhas')}>
                      Ver Todas
                    </Button>
                  </div>
                  <CardDescription>
                    {campaigns.filter(c => c.status === 'active').length} campanhas em execução
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.slice(0, 3).map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`/app/campanhas/${campaign.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${
                            campaign.status === 'active' ? 'bg-green-500' :
                            campaign.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{campaign.name}</p>
                            <p className="text-sm text-gray-500">
                              {campaign.leadsGenerated} leads gerados
                            </p>
                          </div>
                        </div>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status === 'active' ? 'Ativa' : 
                           campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-400" />
                    Campanhas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Nenhuma campanha ativa</p>
                    <Button onClick={() => navigate('/app/campanhas/nova')}>
                      Criar Primeira Campanha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Recent Leads - Real Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary-600" />
                    Leads Recentes
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleViewAllLeads}>
                    Ver Todos
                  </Button>
                </div>
                <CardDescription>
                  {recentLeads.length > 0 
                    ? 'Últimos leads capturados' 
                    : 'Nenhum lead capturado ainda'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLeads.length > 0 ? (
                  <RecentLeadsWidget leads={formattedLeads} />
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Comece a capturar leads</p>
                    <Button onClick={() => navigate('/app/scraping')}>
                      Iniciar Scraping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Usage & Insights */}
          <div className="space-y-6">
            {/* Usage Monitor - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary-600" />
                  Monitor de Uso
                </CardTitle>
                <CardDescription>
                  Acompanhe seu consumo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageMonitorWidget usage={extendedUsage} />
              </CardContent>
            </Card>

            {/* Performance Insights - Real Data */}
            {insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Insights de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        insight.trend === 'up' ? 'bg-green-50' :
                        insight.trend === 'down' ? 'bg-red-50' : 'bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          insight.trend === 'up' ? 'bg-green-600' :
                          insight.trend === 'down' ? 'bg-red-600' : 'bg-blue-600'
                        }`} />
                        <span className="text-sm font-medium">{insight.metric}</span>
                      </div>
                      <Badge variant="outline" className={
                        insight.trend === 'up' ? 'text-green-700 border-green-300' :
                        insight.trend === 'down' ? 'text-red-700 border-red-300' :
                        'text-blue-700 border-blue-300'
                      }>
                        {insight.value}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Stats - Real Data */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total de Leads</span>
                  <span className="font-semibold">{stats.totalLeads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Qualidade Média</span>
                  <span className="font-semibold">{stats.qualityAverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Campanhas Ativas</span>
                  <span className="font-semibold">{campaigns.filter(c => c.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads Alta Qualidade</span>
                  <span className="font-semibold">{stats.qualityDistribution.alta}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads Novos</span>
                  <span className="font-semibold">{stats.leadsBreakdown.novos}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads Qualificados</span>
                  <span className="font-semibold">{stats.leadsBreakdown.qualificados}</span>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Resumo do Ciclo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uso do Plano</span>
                    <span className="font-semibold">{usage.percentageUsed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        usage.percentageUsed > 90 ? 'bg-red-500' :
                        usage.percentageUsed > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(usage.percentageUsed, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {usage.leadsUsed} de {usage.leadsLimit} leads utilizados
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;