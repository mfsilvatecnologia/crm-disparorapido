import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Settings,
  Bell,
  Calendar,
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
  CampaignsWidget
} from '@/features/dashboard';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { DashboardError } from '../components/DashboardError';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { actions } = useQuickActions();

  // Fetch real dashboard data
  const {
    stats,
    recentLeads: apiRecentLeads,
    usage,
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

  // Enhanced mock data for campaigns (until API is ready)
  const mockCampaigns = [
    {
      id: '1',
      name: 'B2B Software - São Paulo',
      status: 'active' as const,
      leadsGenerated: 1247,
      targetLeads: 1500,
      qualityScore: 87,
      invested: 3118,
      budget: 4000,
      progress: 78,
      remainingDays: 2,
      totalDays: 30,
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      segment: 'Software',
      source: 'LinkedIn + Google Maps',
      conversionRate: 12.3
    },
    {
      id: '2', 
      name: 'Agências Marketing - RJ',
      status: 'active' as const,
      leadsGenerated: 892,
      targetLeads: 1000,
      qualityScore: 91,
      invested: 2230,
      budget: 2500,
      progress: 65,
      remainingDays: 5,
      totalDays: 20,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      segment: 'Marketing',
      source: 'Google Maps',
      conversionRate: 15.7
    },
    {
      id: '3',
      name: 'Consultoria Financeira - SP',
      status: 'paused' as const,
      leadsGenerated: 543,
      targetLeads: 800,
      qualityScore: 84,
      invested: 1360,
      budget: 2000,
      progress: 45,
      remainingDays: 10,
      totalDays: 25,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      segment: 'Finanças',
      source: 'LinkedIn',
      conversionRate: 8.9
    }
  ];

  // Extended usage data with additional metrics
  const extendedUsage = {
    ...usage,
    plan: 'Professional',
    activeCampaigns: mockCampaigns.filter((c) => c.status === 'active').length,
    maxCampaigns: 10,
    integrations: 2,
    maxIntegrations: 5,
    exports: 18,
    maxExports: 50,
    apiCalls: 1247,
    maxApiCalls: 5000,
    estimatedDaysUntilLimit: 8,
  };

  // Transform API recent leads to match component format
  const mockRecentLeads = apiRecentLeads.map((lead) => ({
    id: lead.id,
    companyName: lead.empresa || 'N/A',
    contactName: lead.nome || 'Sem nome',
    contactRole: 'Contato',
    email: lead.email || 'N/A',
    phone: lead.telefone || 'N/A',
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

  // Handler functions
  const handleViewAllLeads = () => {
    window.location.href = '/app/leads';
  };

  const handleFilterLeads = () => {
    console.log('Filtrar leads');
  };

  const handleExportLeads = () => {
    console.log('Exportar leads');
  };

  const handleOptimizeQuality = () => {
    console.log('Otimizar qualidade');
  };

  const handleViewReport = () => {
    console.log('Ver relatório');
  };

  const handleAnalyzeGrowth = () => {
    console.log('Analisar crescimento');
  };

  const handleViewCampaign = (campaignId: string) => {
    console.log('Ver campanha:', campaignId);
  };

  const handlePauseCampaign = (campaignId: string) => {
    console.log('Pausar campanha:', campaignId);
  };

  const handleResumeCampaign = (campaignId: string) => {
    console.log('Retomar campanha:', campaignId);
  };

  const handleEditCampaign = (campaignId: string) => {
    console.log('Editar campanha:', campaignId);
  };

  const handleCreateNewCampaign = () => {
    console.log('Nova campanha');
  };

  const getUserFirstName = () => {
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
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
                Sua operação está {getTimeOfDay() === 'manhã' ? 'iniciando bem' : 'performando excelente'} esta {getTimeOfDay()}.
                {extendedUsage.daysRemaining} dias restantes no seu plano.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Agendar Reunião
              </Button>
            </div>
          </div>

          {/* Main Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LeadsMetricCard
              total={stats.totalLeads}
              change={15.3}
              breakdown={stats.leadsBreakdown}
              onViewAll={handleViewAllLeads}
              onFilter={handleFilterLeads}
              onExport={handleExportLeads}
            />

            <QualityMetricCard
              average={stats.qualityAverage}
              distribution={stats.qualityDistribution}
              trend="up"
              onOptimize={handleOptimizeQuality}
            />

            <GrowthMetricCard
              percentage={stats.monthGrowth}
              trend="up"
              onAnalyze={handleAnalyzeGrowth}
            />

            <ROIMetricCard
              value={stats.estimatedROI}
              period="Este mês"
              projection={stats.estimatedROI * 1.2}
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
          {/* Left Column - Campaigns */}
          <div className="lg:col-span-2">
            <CampaignsWidget
              campaigns={mockCampaigns}
              onViewCampaign={handleViewCampaign}
              onPauseCampaign={handlePauseCampaign}
              onResumeCampaign={handleResumeCampaign}
              onEditCampaign={handleEditCampaign}
              onCreateNew={handleCreateNewCampaign}
              className="mb-6"
            />
            
            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Leads Recentes</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleViewAllLeads}>
                    Ver Todos
                  </Button>
                </div>
                <CardDescription>
                  Últimos leads capturados com alta qualidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentLeadsWidget leads={mockRecentLeads} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Usage & Analytics */}
          <div className="space-y-6">
            {/* Usage Monitor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary-600" />
                  Monitor de Uso
                </CardTitle>
                <CardDescription>
                  Acompanhe seu consumo e limites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageMonitorWidget usage={extendedUsage} />
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Insights de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm font-medium">Qualidade em alta</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    +2.3% esta semana
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium">Conversion rate</span>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    12.3% média
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-600 rounded-full"></div>
                    <span className="text-sm font-medium">Otimização sugerida</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver dicas
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Estatísticas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Leads hoje</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Campanhas ativas</span>
                  <span className="font-semibold">{mockCampaigns.filter(c => c.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Custo por lead</span>
                  <span className="font-semibold">R$ 2,50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo médio resposta</span>
                  <span className="font-semibold">4.2h</span>
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
