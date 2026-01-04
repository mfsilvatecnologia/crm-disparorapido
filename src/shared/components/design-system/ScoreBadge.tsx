/**
 * ScoreBadge Component
 * 
 * Displays a numeric score with color-coded styling based on ranges.
 * Used for lead qualification scores and similar metrics.
 * 
 * Score ranges:
 * - 0-50: Low (red)
 * - 51-70: Medium (amber)
 * - 71-89: High (blue)
 * - 90-100: Excellent (green)
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { getScoreConfig } from '@/config/design-tokens';

// =============================================================================
// TYPES
// =============================================================================

export interface ScoreBadgeProps {
  /** Score value (0-100) */
  score: number;
  /** Show numeric value inside badge */
  showValue?: boolean;
  /** Show label (Baixo, Médio, Alto, Excelente) */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// SIZE STYLES
// =============================================================================

const sizeClasses = {
  sm: {
    badge: 'w-8 h-8 text-xs',
    label: 'text-xs',
    gap: 'gap-1.5',
  },
  md: {
    badge: 'w-10 h-10 text-sm',
    label: 'text-sm',
    gap: 'gap-2',
  },
  lg: {
    badge: 'w-12 h-12 text-base',
    label: 'text-base',
    gap: 'gap-2.5',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ScoreBadge displays a score with color-coded styling.
 * 
 * @example
 * // Just the score
 * <ScoreBadge score={85} />
 * 
 * @example
 * // Score with label
 * <ScoreBadge score={85} showLabel />
 * 
 * @example
 * // Large size with both value and label
 * <ScoreBadge score={92} showValue showLabel size="lg" />
 */
export function ScoreBadge({
  score,
  showValue = true,
  showLabel = false,
  size = 'md',
  className,
}: ScoreBadgeProps) {
  // Clamp score to 0-100 range
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const config = getScoreConfig(clampedScore);
  const styles = sizeClasses[size];

  return (
    <div className={cn('inline-flex items-center', styles.gap, className)}>
      {showValue && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold',
            styles.badge,
            config.bg,
            config.color
          )}
          role="img"
          aria-label={`Score: ${clampedScore}`}
        >
          {clampedScore}
        </div>
      )}
      {showLabel && (
        <span className={cn('font-medium', styles.label, config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Default export for convenience
export default ScoreBadge;
