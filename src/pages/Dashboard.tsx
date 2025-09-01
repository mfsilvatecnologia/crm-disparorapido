import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  Users,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useLeads } from '@/hooks/useLeads';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { LeadsChart } from '@/components/dashboard/LeadsChart';
import { QualityChart } from '@/components/dashboard/QualityChart';
import { RegionMap } from '@/components/dashboard/RegionMap';

export default function Dashboard() {
  const { currentOrganization } = useOrganization();

  // Fetch real leads data
  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    limit: 1000, // Get more data for analytics
  });

  // Mock analytics data for now - will be replaced with real analytics endpoint
  const { data: analytics } = useQuery({
    queryKey: ['analytics', currentOrganization?.id],
    queryFn: () => {
      // Mock analytics data - replace with real API call
      return Promise.resolve([
        { date: '2024-01-01', leadsCollected: 1250, leadsAccessed: 890, qualityAverage: 85, cost: 2340, conversions: 45 },
        { date: '2024-01-02', leadsCollected: 1180, leadsAccessed: 920, qualityAverage: 82, cost: 2450, conversions: 52 },
        { date: '2024-01-03', leadsCollected: 1320, leadsAccessed: 1100, qualityAverage: 88, cost: 2890, conversions: 61 },
        { date: '2024-01-04', leadsCollected: 1450, leadsAccessed: 1200, qualityAverage: 91, cost: 3200, conversions: 68 },
        { date: '2024-01-05', leadsCollected: 1380, leadsAccessed: 1050, qualityAverage: 86, cost: 2980, conversions: 55 },
        { date: '2024-01-06', leadsCollected: 1290, leadsAccessed: 980, qualityAverage: 84, cost: 2650, conversions: 49 },
        { date: '2024-01-07', leadsCollected: 1410, leadsAccessed: 1150, qualityAverage: 89, cost: 3100, conversions: 63 },
      ]);
    },
    enabled: !!currentOrganization,
  });

  const { data: usageMetrics } = useQuery({
    queryKey: ['usage', currentOrganization?.id],
    queryFn: () => {
      // Mock usage data - replace with real API call
      return Promise.resolve({
        period: { from: '2024-01-01', to: '2024-01-31' },
        leadsAccessed: 8234,
        apiRequests: 15420,
        totalCost: 4117.50,
        quotaUsed: 8234,
        quotaTotal: 10000,
        conversionRate: 0.067,
      });
    },
    enabled: !!currentOrganization,
  });

  // Calculate metrics from real leads data
  const totalLeads = leadsData?.total || 0;
  const leadsItems = leadsData?.items || [];
  const avgQuality = leadsItems.length > 0
    ? leadsItems.reduce((sum, lead) => sum + (lead.qualityScore || 0), 0) / leadsItems.length
    : 0;

  // Mock data for charts (will be replaced with real analytics)
  const totalAccessed = analytics?.reduce((sum, day) => sum + day.leadsAccessed, 0) || 0;
  const totalConversions = analytics?.reduce((sum, day) => sum + day.conversions, 0) || 0;

  const quotaPercent = usageMetrics ? (usageMetrics.quotaUsed / usageMetrics.quotaTotal) * 100 : 0;
  const getQuotaStatus = () => {
    if (quotaPercent >= 90) return { color: 'destructive', label: 'Crítico' };
    if (quotaPercent >= 75) return { color: 'secondary', label: 'Atenção' };
    return { color: 'secondary', label: 'Normal' };
  };

  const quotaStatus = getQuotaStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas métricas e performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            Exportar Relatório
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Configurar Dashboard</DropdownMenuItem>
              <DropdownMenuItem>Agendar Relatório</DropdownMenuItem>
              <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Leads"
          value={leadsLoading ? '...' : formatNumber(totalLeads)}
          description="Leads na base de dados"
          icon={Users}
          trend="up"
        />
        <KpiCard
          title="Qualidade Média"
          value={leadsLoading ? '...' : `${avgQuality.toFixed(0)}%`}
          description="Score médio dos leads"
          icon={Target}
          trend="up"
        />
        <KpiCard
          title="Leads Acessados"
          value={formatNumber(totalAccessed)}
          description="Leads visualizados este mês"
          icon={TrendingUp}
          trend="up"
        />
        <KpiCard
          title="Custo do Mês"
          value={formatCurrency(usageMetrics?.totalCost || 0)}
          description="R$ 0,50 por lead"
          icon={CreditCard}
          trend="stable"
        />
      </div>

      {/* Quota Status */}
      <Card className="bg-gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Uso da Quota</CardTitle>
              <CardDescription>
                {formatNumber(usageMetrics?.quotaUsed || 0)} de {formatNumber(usageMetrics?.quotaTotal || 0)} leads
              </CardDescription>
            </div>
            <Badge variant={quotaStatus.color as "default" | "secondary" | "destructive" | "outline"}>
              {quotaStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress 
            value={quotaPercent} 
            className="h-3 mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{quotaPercent.toFixed(1)}% utilizado</span>
            <Button variant="link" className="h-auto p-0 text-primary">
              Comprar mais créditos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadsChart data={analytics || []} />
        <QualityChart data={analytics || []} />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RegionMap />
        </div>
        
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle>Conversões Recentes</CardTitle>
            <CardDescription>Últimas conversões de leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { company: 'Tech Solutions LTDA', value: 'R$ 25.000', time: '2h atrás' },
                { company: 'Inovação Digital', value: 'R$ 18.500', time: '4h atrás' },
                { company: 'StartupXYZ', value: 'R$ 12.300', time: '6h atrás' },
                { company: 'Consultoria ABC', value: 'R$ 31.200', time: '8h atrás' },
              ].map((conversion, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium text-sm">{conversion.company}</p>
                    <p className="text-xs text-muted-foreground">{conversion.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-success">{conversion.value}</p>
                    <ArrowUpRight className="h-3 w-3 text-success ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}