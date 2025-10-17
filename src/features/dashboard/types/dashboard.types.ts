/**
 * Dashboard Types
 * Types for dashboard data structures and API responses
 */

export interface DashboardStats {
  totalLeads: number;
  qualityAverage: number;
  monthGrowth: number;
  estimatedROI: number;
  leadsBreakdown: {
    novos: number;
    qualificados: number;
    convertidos: number;
  };
  qualityDistribution: {
    alta: number;
    media: number;
    baixa: number;
  };
}

export interface CampaignSummary {
  id: string;
  name: string;
  leadsGenerated: number;
  qualityScore: number;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
}

export interface RecentLead {
  id: string;
  nome: string;
  empresa: string;
  telefone: string;
  email: string;
  score: number;
  status: string;
  createdAt: string;
}

export interface UsageMetrics {
  leadsUsed: number;
  leadsLimit: number;
  daysRemaining: number;
  resetDate: string;
  percentageUsed: number;
}

export interface PerformanceInsight {
  metric: string;
  value: number | string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  description: string;
}

export interface DashboardData {
  stats: DashboardStats;
  campaigns: CampaignSummary[];
  recentLeads: RecentLead[];
  usage: UsageMetrics;
  insights: PerformanceInsight[];
  isLoading: boolean;
  error: Error | null;
}
