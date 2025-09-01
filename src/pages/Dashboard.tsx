import React from 'react';
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Rocket,
  BarChart3,
  FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/hooks/useLeads';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { ActiveCampaignsWidget } from '@/components/dashboard/ActiveCampaignsWidget';
import { RecentLeadsWidget } from '@/components/dashboard/RecentLeadsWidget';
import { UsageMonitorWidget } from '@/components/dashboard/UsageMonitorWidget';

const Dashboard: React.FC = () => {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  // Fetch real leads data
  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    limit: 10,
  });

  // Mock data
  const mockCampaigns = [
    {
      id: '1',
      name: 'B2B Software - São Paulo',
      status: 'active' as const,
      leadsGenerated: 1247,
      qualityScore: 87,
      invested: 3118,
      progress: 78,
      remainingDays: 2,
      targetLeads: 1500
    },
    {
      id: '2', 
      name: 'Agências Marketing - RJ',
      status: 'active' as const,
      leadsGenerated: 892,
      qualityScore: 91,
      invested: 2230,
      progress: 65,
      remainingDays: 5,
      targetLeads: 1000
    }
  ];

  const mockUsage = {
    plan: 'Professional',
    leadsUsed: 2847,
    leadsLimit: 4000,
    daysRemaining: 12,
    activeCampaigns: 4,
    maxCampaigns: 10,
    integrations: 2,
    maxIntegrations: 5,
    exports: 18,
    maxExports: 50,
    apiCalls: 1247,
    maxApiCalls: 5000,
    estimatedDaysUntilLimit: 8
  };

  const mockRecentLeads = [
    {
      id: '1',
      companyName: 'TechStart Solutions',
      contactName: 'Maria Silva',
      contactRole: 'CEO',
      email: 'maria@techstart.com.br',
      phone: '(11) 99999-9999',
      sector: 'Software',
      location: 'São Paulo',
      employees: 25,
      qualityScore: 94,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      campaign: 'B2B Software - SP',
      linkedinUrl: 'https://linkedin.com/in/maria-silva'
    }
  ];

  const totalLeads = leadsData?.items?.length || 2847;
  const qualityAverage = 89;
  const monthGrowth = 247;
  const estimatedROI = 8340;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getUserFirstName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'Usuário';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {getUserFirstName()}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                Professional
              </span>
              <span className="text-gray-600">
                {mockUsage.daysRemaining} dias restantes
              </span>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Leads"
            value={totalLeads.toLocaleString()}
            description="Este mês"
            icon={Users}
            trend="up"
            trendValue="↗"
          />
          <KpiCard
            title="Qualidade"
            value={`${qualityAverage}%`}
            description="Média"
            icon={Target}
            trend="stable"
            trendValue="✓"
          />
          <KpiCard
            title="Crescimento"
            value={`${monthGrowth}%`}
            description="vs mês ant."
            icon={TrendingUp}
            trend="up"
            trendValue="📈"
          />
          <KpiCard
            title="ROI Est."
            value={`R$ ${estimatedROI.toLocaleString()}`}
            description="Este mês"
            icon={DollarSign}
            trend="up"
            trendValue="💰"
          />
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap gap-3">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Rocket className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ver Relatório
          </Button>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Exportar Leads
          </Button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Campanhas Ativas */}
        <div className="xl:col-span-2">
          <ActiveCampaignsWidget campaigns={mockCampaigns} />
        </div>

        {/* Usage Monitor */}
        <div>
          <UsageMonitorWidget usage={mockUsage} />
        </div>

        {/* Leads Recentes */}
        <div className="lg:col-span-2">
          <RecentLeadsWidget leads={mockRecentLeads} />
        </div>

        {/* Performance Analytics Widget */}
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance (30 dias)</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-primary-600">
              Personalizar
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Gráfico de Performance</p>
                <p className="text-xs">Em desenvolvimento</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Fontes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🕷 Web Scraping</span>
                  <span className="font-medium">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">📥 Listas Importadas</span>
                  <span className="font-medium">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🔗 Integrações API</span>
                  <span className="font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
