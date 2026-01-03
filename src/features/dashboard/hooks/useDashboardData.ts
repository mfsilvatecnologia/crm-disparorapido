import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/client';
import { DashboardData, DashboardStats, RecentLead, UsageMetrics, CampaignSummary } from '../types/dashboard.types';
import { endOfMonth, differenceInDays, startOfMonth, subMonths } from 'date-fns';
import { useCampaigns, useCampaignStats } from '@/features/campaigns/hooks/useCampaigns';

/**
 * Calculate quality average from leads
 */
function calculateQualityAvg(leads: any[] | undefined): number {
  if (!leads || leads.length === 0) return 0;
  const sum = leads.reduce((acc, lead) => acc + (lead.score || 0), 0);
  return Math.round(sum / leads.length);
}

/**
 * Calculate quality distribution from leads
 */
function calculateQualityDistribution(leads: any[] | undefined) {
  if (!leads || leads.length === 0) {
    return { alta: 0, media: 0, baixa: 0 };
  }

  const distribution = leads.reduce(
    (acc, lead) => {
      const score = lead.score || 0;
      if (score >= 80) acc.alta++;
      else if (score >= 50) acc.media++;
      else acc.baixa++;
      return acc;
    },
    { alta: 0, media: 0, baixa: 0 }
  );

  return distribution;
}

/**
 * Calculate leads breakdown by status
 */
function calculateLeadsBreakdown(leads: any[] | undefined) {
  if (!leads || leads.length === 0) {
    return { novos: 0, qualificados: 0, convertidos: 0 };
  }

  const breakdown = leads.reduce(
    (acc, lead) => {
      const status = lead.status?.toLowerCase() || '';
      if (status.includes('novo')) acc.novos++;
      else if (status.includes('qualificado')) acc.qualificados++;
      else if (status.includes('convertido')) acc.convertidos++;
      return acc;
    },
    { novos: 0, qualificados: 0, convertidos: 0 }
  );

  return breakdown;
}

/**
 * Main hook for dashboard data
 * Aggregates all necessary queries for the dashboard
 */
export function useDashboardData(): DashboardData {
  const today = new Date();
  const startOfCurrentMonth = startOfMonth(today);
  const startOfPreviousMonth = startOfMonth(subMonths(today, 1));
  const endOfMonthDate = endOfMonth(today);

  // Query 1: Recent leads (last 10)
  const {
    data: recentLeadsData,
    isLoading: recentLeadsLoading,
    error: recentLeadsError,
  } = useQuery({
    queryKey: ['dashboard', 'recent-leads'],
    queryFn: () =>
      apiClient.getLeads({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query 2: Leads do mês atual para estatísticas
  const {
    data: currentMonthLeadsData,
    isLoading: currentMonthLeadsLoading,
    error: currentMonthLeadsError,
  } = useQuery({
    queryKey: ['dashboard', 'current-month-leads', startOfCurrentMonth.toISOString()],
    queryFn: () =>
      apiClient.getLeads({
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        // Filtro por data quando disponível na API
      }),
    staleTime: 1000 * 60 * 5,
  });

  // Query 3: Campanhas ativas (dados reais)
  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useCampaigns({ ativas: true });

  // Query 4: Estatísticas de campanhas (dados reais)
  const {
    data: campaignStatsData,
    isLoading: campaignStatsLoading,
    error: campaignStatsError,
  } = useCampaignStats();

  // Calculate combined loading and error states
  const isLoading = recentLeadsLoading || currentMonthLeadsLoading || campaignsLoading || campaignStatsLoading;
  const error = recentLeadsError || currentMonthLeadsError || campaignsError || campaignStatsError || null;

  // Transform recent leads data - mapping API fields correctly
  const recentLeads: RecentLead[] =
    recentLeadsData?.items?.map((lead) => ({
      id: lead.id,
      nome: lead.nomeContato || 'N/A',
      empresa: lead.nomeEmpresa || 'N/A',
      telefone: lead.telefone || 'N/A',
      email: lead.email || 'N/A',
      score: lead.scoreQualificacao || 0,
      status: lead.status || 'novo',
      createdAt: lead.createdAt || new Date().toISOString(),
    })) || [];

  // Transform campaigns data for dashboard
  const campaigns: CampaignSummary[] = (campaignsData?.campaigns || []).map((campaign) => ({
    id: campaign.id,
    name: campaign.nome,
    leadsGenerated: campaign.metaLeads || 0,
    qualityScore: 0, // Calculado por analytics quando disponível
    progress: campaign.metaLeads ? Math.min(100, Math.round((campaign.metaLeads / (campaign.metaLeads || 1)) * 100)) : 0,
    status: campaign.status === 'ativa' ? 'active' : campaign.status === 'pausada' ? 'paused' : 'completed',
    budget: (campaign.budgetMaximoCentavos || 0) / 100,
    spent: (campaign.custoPorLeadCentavos || 0) / 100,
    startDate: campaign.dataInicio || campaign.createdAt,
    endDate: campaign.dataFim || undefined,
  }));

  // Calculate ROI from campaign stats
  const estimatedROI = campaignStatsData?.performanceGeral?.roiMedio || 0;
  const totalConversionRate = campaignStatsData?.performanceGeral?.taxaConversaoMedia || 0;

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    totalLeads: currentMonthLeadsData?.total || 0,
    qualityAverage: calculateQualityAvg(currentMonthLeadsData?.items),
    monthGrowth: totalConversionRate, // Usando taxa de conversão como métrica de crescimento
    estimatedROI: estimatedROI,
    leadsBreakdown: calculateLeadsBreakdown(currentMonthLeadsData?.items),
    qualityDistribution: calculateQualityDistribution(currentMonthLeadsData?.items),
  };

  // Usage metrics
  const usage: UsageMetrics = {
    leadsUsed: currentMonthLeadsData?.total || 0,
    leadsLimit: 4000, // TODO: Get from organization settings via API
    daysRemaining: differenceInDays(endOfMonthDate, today),
    resetDate: endOfMonthDate.toISOString(),
    percentageUsed: Math.round(((currentMonthLeadsData?.total || 0) / 4000) * 100),
  };

  // Performance insights from real data
  const insights = campaignStatsData ? [
    {
      metric: 'Taxa de Abertura',
      value: `${(campaignStatsData.performanceGeral?.taxaAberturaMedia || 0).toFixed(1)}%`,
      trend: 'stable' as const,
      change: 0,
      description: 'Média de abertura de emails/mensagens',
    },
    {
      metric: 'Taxa de Conversão',
      value: `${(campaignStatsData.performanceGeral?.taxaConversaoMedia || 0).toFixed(1)}%`,
      trend: 'up' as const,
      change: campaignStatsData.performanceGeral?.taxaConversaoMedia || 0,
      description: 'Leads convertidos em clientes',
    },
    {
      metric: 'Campanhas Ativas',
      value: campaignStatsData.ativas || 0,
      trend: 'stable' as const,
      change: 0,
      description: 'Campanhas em execução',
    },
  ] : [];

  return {
    stats,
    campaigns,
    recentLeads,
    usage,
    insights,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook for dashboard statistics only
 * Lighter version when only stats are needed
 */
export function useDashboardStats() {
  const { stats, isLoading, error } = useDashboardData();
  return { stats, isLoading, error };
}

/**
 * Hook for recent leads only
 */
export function useDashboardRecentLeads() {
  return useQuery({
    queryKey: ['dashboard', 'recent-leads'],
    queryFn: () =>
      apiClient.getLeads({
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    staleTime: 1000 * 60 * 5,
  });
}
