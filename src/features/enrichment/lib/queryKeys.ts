import type { StatsPeriod } from '../types/enrichment';

export const queryKeys = {
  providers: ['enrichment', 'providers'] as const,
  enrichmentJob: (jobId: string) => ['enrichment', 'jobs', jobId] as const,
  investigation: (investigationId: string) => ['enrichment', 'investigations', investigationId] as const,
  stats: (period: StatsPeriod, providerId?: string) =>
    ['enrichment', 'stats', period.start, period.end, providerId ?? 'all'] as const,
};
