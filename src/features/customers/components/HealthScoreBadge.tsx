import React from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { HEALTH_SCORE_THRESHOLDS } from '../lib/constants';

interface HealthScoreBadgeProps {
  score: number;
}

export function HealthScoreBadge({ score }: HealthScoreBadgeProps) {
  let className = 'bg-rose-100 text-rose-700';
  if (score >= HEALTH_SCORE_THRESHOLDS.healthy) {
    className = 'bg-emerald-100 text-emerald-700';
  } else if (score >= HEALTH_SCORE_THRESHOLDS.atRisk) {
    className = 'bg-amber-100 text-amber-700';
  }

  return <Badge className={className}>Health {score}</Badge>;
}
