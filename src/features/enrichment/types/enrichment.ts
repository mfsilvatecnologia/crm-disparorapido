export type EnrichmentStatus = 'queued' | 'processing' | 'completed' | 'error';
export type InvestigationStatus = 'pending' | 'running' | 'completed' | 'failed';
export type ProviderType = 'web_search' | 'location' | 'company_data';
export type ProviderHealthStatus = 'active' | 'degraded' | 'inactive';
export type Assessment = 'positive' | 'neutral' | 'suspect' | 'negative';
export type Level = 'low' | 'medium' | 'high';

export interface Lead {
  id: string;
  name?: string;
  company?: string;
  contact?: string;
  enrichmentStatus: EnrichmentStatus;
  latestEnrichmentJobId?: string | null;
  dossierId?: string | null;
}

export interface EnrichmentResult {
  provider: string;
  status: 'success' | 'error';
  output?: Record<string, unknown>;
  creditsConsumed?: number;
  confidenceScore?: number;
  receivedAt?: string;
  errorMessage?: string | null;
}

export interface EnrichmentJob {
  id: string;
  leadId: string;
  providersSelected: string[];
  status: EnrichmentStatus;
  results: EnrichmentResult[];
  totalEstimatedCost?: number;
  totalConsumedCredits?: number;
  startedAt?: string;
  completedAt?: string | null;
  traceId?: string;
  executionIds?: string[];
}

export interface InvestigationSource {
  url: string;
  title: string;
  assessment: Assessment;
  confidence: Level;
  impact: Level;
  categories: string[];
  justification: string;
  publishedAt?: string | null;
}

export interface InvestigationCounts {
  positive: number;
  neutral: number;
  suspect: number;
  negative: number;
}

export interface Investigation {
  id: string;
  dossierId: string;
  status: InvestigationStatus;
  estimatedDurationSec?: number;
  startedAt?: string;
  completedAt?: string | null;
  riskScore?: number | null;
  counts?: InvestigationCounts;
  sources?: InvestigationSource[];
  cost?: number;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  enabled: boolean;
  priority: number;
  rateLimitPerMin: number;
  costPerRequest: number;
  healthStatus: ProviderHealthStatus;
}

export interface StatsProviderRow {
  providerId: string;
  executions: number;
  successRatePct: number;
  totalCost: number;
  avgDurationSec: number;
}

export interface StatsPeriod {
  start: string;
  end: string;
}

export interface StatsOverviewTotals {
  totalExecutions: number;
  overallSuccessRatePct: number;
  overallCost: number;
  activeProviders: number;
}

export interface StatsOverview {
  period: StatsPeriod;
  providerStats: StatsProviderRow[];
  totals: StatsOverviewTotals;
}
