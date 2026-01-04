/**
 * RelativeTime Component
 * 
 * Displays a date as relative time (e.g., "há 2 horas", "ontem").
 * Optionally shows tooltip with full date on hover.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/utils';
import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export interface RelativeTimeProps {
  /** Date to format (ISO string or Date object) */
  date: string | Date;
  /** Update interval in ms (0 = no live updates, default: 60000 = 1 min) */
  updateInterval?: number;
  /** Prefix text (e.g., "Atualizado") */
  prefix?: string;
  /** Show tooltip with full date on hover */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function parseDate(date: string | Date): Date | null {
  if (date instanceof Date) {
    return isValid(date) ? date : null;
  }
  
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function formatRelative(date: Date): string {
  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: ptBR,
  });
}

function formatFull(date: Date): string {
  return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
    locale: ptBR,
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * RelativeTime displays a date in relative format.
 * 
 * @example
 * // Basic usage
 * <RelativeTime date="2024-01-15T10:30:00Z" />
 * 
 * @example
 * // With prefix and tooltip
 * <RelativeTime 
 *   date={lead.updatedAt} 
 *   prefix="Atualizado" 
 *   showTooltip 
 * />
 * 
 * @example
 * // With live updates every 30 seconds
 * <RelativeTime date={activity.createdAt} updateInterval={30000} />
 */
export function RelativeTime({
  date,
  updateInterval = 60000,
  prefix,
  showTooltip = true,
  className,
}: RelativeTimeProps) {
  const parsedDate = parseDate(date);
  const [relativeText, setRelativeText] = useState<string>(() =>
    parsedDate ? formatRelative(parsedDate) : ''
  );

  // Update relative time at specified interval
  useEffect(() => {
    if (!parsedDate || updateInterval === 0) return;

    const timer = setInterval(() => {
      setRelativeText(formatRelative(parsedDate));
    }, updateInterval);

    return () => clearInterval(timer);
  }, [parsedDate, updateInterval]);

  // Handle invalid dates
  if (!parsedDate) {
    return (
      <span className={cn('text-muted-foreground', className)}>
        Data inválida
      </span>
    );
  }

  const content = (
    <span className={cn('text-muted-foreground', className)}>
      {prefix && `${prefix} `}
      {relativeText}
    </span>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            className={cn('text-muted-foreground cursor-help', className)}
            tabIndex={0}
          >
            {prefix && `${prefix} `}
            {relativeText}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formatFull(parsedDate)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Default export for convenience
export default RelativeTime;
