export type TimelineEventType =
  | 'activity'
  | 'status_change'
  | 'contract'
  | 'note'
  | 'system';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface CustomerTimelineResponseApi {
  data: Array<{
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string | null;
    created_at: string;
    metadata?: Record<string, unknown> | null;
  }>;
}

export interface HealthScoreResponse {
  score: number;
  factors: {
    engagement: number;
    contractValue: number;
    activityRecency: number;
  };
  status: 'healthy' | 'at_risk' | 'critical' | 'insufficient_data';
}
