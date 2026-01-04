/**
 * TourProgress Component
 * 
 * Displays progress indicator (e.g., "2/5") for the tour.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';

export interface TourProgressProps {
  /** Current step number (1-indexed) */
  current: number;
  /** Total number of steps */
  total: number;
  /** Optional className */
  className?: string;
}

/**
 * TourProgress - Progress indicator for tour
 * 
 * @example
 * ```tsx
 * <TourProgress current={2} total={5} />
 * ```
 */
export function TourProgress({ current, total, className }: TourProgressProps) {
  const percentage = (current / total) * 100;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="text-xs text-muted-foreground font-medium">
        {current} de {total}
      </div>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[100px]">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
