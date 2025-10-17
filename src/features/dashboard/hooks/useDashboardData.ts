import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/client';
import { DashboardData, DashboardStats, RecentLead, UsageMetrics, CampaignSummary } from '../types/dashboard.types';
import { endOfMonth, differenceInDays } from 'date-fns';

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

  // Query 2: All leads for statistics (limited for performance)
  const {
    data: allLeadsData,
    isLoading: allLeadsLoading,
    error: allLeadsError,
  } = useQuery({
    queryKey: ['dashboard', 'all-leads-stats'],
    queryFn: () =>
      apiClient.getLeads({
        limit: 1000, // Limit for performance
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query 3: Empresas statistics (disabled for now)
  const {
    isLoading: empresasLoading,
    error: empresasError,
  } = useQuery({
    queryKey: ['dashboard', 'empresas-stats'],
    queryFn: () => apiClient.getEmpresasStats(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: false, // Disable until we verify endpoint
  });

  // Calculate combined loading and error states
  const isLoading = recentLeadsLoading || allLeadsLoading || empresasLoading;
  const error = recentLeadsError || allLeadsError || empresasError || null;

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

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    totalLeads: allLeadsData?.total || 0,
    qualityAverage: calculateQualityAvg(allLeadsData?.items),
    monthGrowth: 0, // TODO: Calculate from analytics when endpoint is ready
    estimatedROI: 0, // TODO: Calculate from pipeline stats when endpoint is ready
    leadsBreakdown: calculateLeadsBreakdown(allLeadsData?.items),
    qualityDistribution: calculateQualityDistribution(allLeadsData?.items),
  };

  // Usage metrics - Mock for now, will implement when endpoint is ready
  const today = new Date();
  const endOfMonthDate = endOfMonth(today);
  const usage: UsageMetrics = {
    leadsUsed: allLeadsData?.total || 0,
    leadsLimit: 4000, // TODO: Get from organization settings
    daysRemaining: differenceInDays(endOfMonthDate, today),
    resetDate: endOfMonthDate.toISOString(),
    percentageUsed: Math.round(((allLeadsData?.total || 0) / 4000) * 100),
  };

  // Campaigns - Mock for now, will implement when endpoint is ready
  const campaigns: CampaignSummary[] = [];

  // Performance insights - Will be implemented later
  const insights = [];

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
