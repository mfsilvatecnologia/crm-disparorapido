import React, { useState, useMemo } from 'react';
import {
  Database,
  TrendingUp,
  Users,
  Target,
  Zap,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Sparkles,
  BarChart3,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  LeadsSection,
  OpportunitiesSection,
  CustomersSection,
  ConversionPipeline,
  ScrapingButton,
  CampaignCreator
} from '../components';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { useOpportunities } from '@/features/opportunities/api/opportunities';
import { useCustomers } from '@/features/customers/api/customers';

type CRMView = 'leads' | 'opportunities' | 'customers' | 'pipeline';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export default function CRMPage() {
  const [activeView, setActiveView] = useState<CRMView>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrapingModal, setShowScrapingModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Buscar dados reais
  const { data: leadsData } = useLeads({ page: 1, limit: 1000 });
  const { data: opportunitiesData } = useOpportunities();
  const { data: customersData } = useCustomers();

  // Processar dados
  const allLeads = leadsData?.items || [];
  const allOpportunities = useMemo(() => {
    return opportunitiesData?.pages.flatMap(page => page.data) || [];
  }, [opportunitiesData]);
  const allCustomers = useMemo(() => {
    return customersData?.pages.flatMap(page => page.data) || [];
  }, [customersData]);

  // Calcular métricas reais
  const totalLeads = allLeads.length;
  const totalOpportunities = allOpportunities.filter(o => o.status === 'active').length;
  const totalCustomers = allCustomers.filter(c => c.status === 'ATIVO').length;
  const opportunitiesValue = allOpportunities.reduce((sum, o) => sum + (o.valorEstimado || 0), 0);
  const conversionRate = totalLeads > 0 ? ((totalCustomers / totalLeads) * 100).toFixed(1) : '0';

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);

  // Handler para click nos cards de métricas
  const handleMetricClick = (metricId: string) => {
    switch (metricId) {
      case 'leads':
        setActiveView('leads');
        break;
      case 'opportunities':
      case 'revenue':
        setActiveView('opportunities');
        break;
      case 'customers':
        setActiveView('customers');
        break;
      case 'conversion':
        setActiveView('pipeline');
        break;
    }
  };

  // Métricas principais com dados reais - Estilo Zoho
  const metrics: MetricCard[] = [
    {
      id: 'leads',
      title: 'TOTAL LEADS',
      value: totalLeads,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'opportunities',
      title: 'OPORTUNIDADES ATIVAS',
      value: totalOpportunities,
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    {
      id: 'customers',
      title: 'CLIENTES',
      value: totalCustomers,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    {
      id: 'revenue',
      title: 'RECEITA PROJETADA',
      value: formatCurrency(opportunitiesValue),
      change: '+18%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'conversion',
      title: 'TAXA DE CONVERSÃO',
      value: `${conversionRate}%`,
      change: '+3.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 border-pink-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal - Estilo Zoho */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Unificado</h1>
              <p className="text-sm text-gray-600">
                Gerencie leads, oportunidades e clientes em um único lugar
              </p>
            </div>

            {/* Ações Principais */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="border-gray-300 bg-white hover:bg-gray-50 h-10"
                onClick={() => {}}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>

              <Button
                variant="outline"
                className="border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 h-10"
                onClick={() => setShowCampaignModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Campanha
              </Button>

              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-10 shadow-md hover:shadow-lg transition-all"
                onClick={() => setShowScrapingModal(true)}
              >
                <Globe className="mr-2 h-4 w-4" />
                Buscar Leads
              </Button>
            </div>
          </div>

          {/* Métricas Principais - Cards Horizontais Estilo Zoho */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((metric) => (
              <Card
                key={metric.id}
                className={`border-2 ${metric.bgColor} hover:shadow-lg hover:scale-105 transition-all cursor-pointer`}
                onClick={() => handleMetricClick(metric.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-white/50 ${metric.color}`}>
                      {React.createElement(metric.icon, { className: 'h-5 w-5' })}
                    </div>
                    {metric.change && (
                      <Badge
                        variant="secondary"
                        className={`text-xs font-semibold ${
                          metric.trend === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {metric.change}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                      {metric.title}
                    </p>
                    <p className={`text-2xl font-bold ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tabs de Navegação - Estilo Zoho */}
        <div className="px-8">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as CRMView)} className="w-full">
            <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0">
              <TabsTrigger
                value="pipeline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-blue-600"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Pipeline de Conversão
              </TabsTrigger>
              <TabsTrigger
                value="leads"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-blue-600"
              >
                <Users className="mr-2 h-4 w-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-blue-600"
              >
                <Target className="mr-2 h-4 w-4" />
                Oportunidades
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3 text-sm font-semibold data-[state=active]:text-blue-600"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Clientes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="px-8 py-6">
        <Tabs value={activeView} className="w-full">
          {/* Pipeline de Conversão */}
          <TabsContent value="pipeline" className="mt-0">
            <ConversionPipeline />
          </TabsContent>

          {/* Leads */}
          <TabsContent value="leads" className="mt-0">
            <LeadsSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Oportunidades */}
          <TabsContent value="opportunities" className="mt-0">
            <OpportunitiesSection searchTerm={searchTerm} />
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="customers" className="mt-0">
            <CustomersSection searchTerm={searchTerm} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <ScrapingButton
        open={showScrapingModal}
        onClose={() => setShowScrapingModal(false)}
      />

      <CampaignCreator
        open={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
      />
    </div>
  );
}
