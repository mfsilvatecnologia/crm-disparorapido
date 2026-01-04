/**
 * StatsWidget Component
 * 
 * Displays multiple statistics in a compact, horizontal layout.
 * Used for page headers to show key metrics at a glance.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { ArrowUp, ArrowDown, Minus, type LucideIcon } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';

// =============================================================================
// TYPES
// =============================================================================

export type StatFormat = 'number' | 'currency' | 'percentage';
export type StatColor = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatItem {
  /** Unique identifier */
  id: string;
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Change from previous period (percentage) */
  change?: number;
  /** Direction of change for styling */
  changeDirection?: 'up' | 'down' | 'neutral';
  /** Icon to display */
  icon?: LucideIcon;
  /** Color theme */
  color?: StatColor;
  /** Optional progress value (0-100) */
  progress?: number;
  /** Value format type */
  format?: StatFormat;
}

export interface StatsWidgetProps {
  /** Array of stats to display */
  stats: StatItem[];
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show dividers between stats */
  showDividers?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// STYLES
// =============================================================================

const colorClasses: Record<StatColor, string> = {
  primary: 'text-primary-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
  neutral: 'text-gray-600',
};

const changeColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-500',
};

const sizeClasses = {
  sm: {
    value: 'text-lg font-semibold',
    label: 'text-xs',
    icon: 'h-4 w-4',
    change: 'text-xs',
    container: 'py-2 px-3',
  },
  md: {
    value: 'text-2xl font-bold',
    label: 'text-sm',
    icon: 'h-5 w-5',
    change: 'text-sm',
    container: 'py-3 px-4',
  },
  lg: {
    value: 'text-3xl font-bold',
    label: 'text-base',
    icon: 'h-6 w-6',
    change: 'text-base',
    container: 'py-4 px-5',
  },
};

// =============================================================================
// HELPERS
// =============================================================================

function formatValue(value: string | number, format?: StatFormat): string {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value}%`;
    case 'number':
    default:
      return new Intl.NumberFormat('pt-BR').format(value);
  }
}

function getChangeIcon(direction?: 'up' | 'down' | 'neutral') {
  switch (direction) {
    case 'up':
      return ArrowUp;
    case 'down':
      return ArrowDown;
    default:
      return Minus;
  }
}

// =============================================================================
// STAT ITEM COMPONENT
// =============================================================================

interface StatItemComponentProps {
  stat: StatItem;
  size: 'sm' | 'md' | 'lg';
}

function StatItemComponent({ stat, size }: StatItemComponentProps) {
  const styles = sizeClasses[size];
  const color = stat.color || 'neutral';
  const ChangeIcon = getChangeIcon(stat.changeDirection);
  const Icon = stat.icon;

  return (
    <div className={cn('flex flex-col', styles.container)}>
      {/* Label with optional icon */}
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && (
          <Icon className={cn(styles.icon, colorClasses[color])} />
        )}
        <span className={cn(styles.label, 'text-muted-foreground')}>
          {stat.label}
        </span>
      </div>

      {/* Value */}
      <div className={cn(styles.value, colorClasses[color])}>
        {formatValue(stat.value, stat.format)}
      </div>

      {/* Change indicator */}
      {stat.change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-1',
          styles.change,
          changeColors[stat.changeDirection || 'neutral']
        )}>
          <ChangeIcon className="h-3 w-3" />
          <span>{Math.abs(stat.change)}%</span>
        </div>
      )}

      {/* Progress bar */}
      {stat.progress !== undefined && (
        <div className="mt-2 w-full">
          <Progress value={stat.progress} className="h-1.5" />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * StatsWidget displays multiple statistics in a compact layout.
 * 
 * @example
 * <StatsWidget
 *   stats={[
 *     { id: 'total', label: 'Total Leads', value: 1234 },
 *     { id: 'converted', label: 'Convertidos', value: 89, change: 12, changeDirection: 'up' },
 *     { id: 'mrr', label: 'MRR', value: 45000, format: 'currency', color: 'success' },
 *   ]}
 * />
 */
export function StatsWidget({
  stats,
  layout = 'horizontal',
  size = 'md',
  showDividers = true,
  className,
}: StatsWidgetProps) {
  if (stats.length === 0) return null;

  const isHorizontal = layout === 'horizontal';

  return (
    <div
      className={cn(
        'bg-card rounded-lg border',
        isHorizontal ? 'flex flex-wrap items-stretch' : 'flex flex-col',
        className
      )}
    >
      {stats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          <StatItemComponent stat={stat} size={size} />
          
          {/* Divider */}
          {showDividers && index < stats.length - 1 && (
            <div
              className={cn(
                'bg-border',
                isHorizontal ? 'w-px my-2' : 'h-px mx-4'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Default export for convenience
export default StatsWidget;
