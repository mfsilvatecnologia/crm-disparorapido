/**
 * ViewSwitcher Component
 * 
 * Allows switching between different view modes (list, kanban, cards, etc.).
 * Displays icons for each available view.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { 
  List, 
  Kanban, 
  LayoutGrid, 
  Calendar, 
  GitBranch,
  type LucideIcon 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export type ViewMode = 'list' | 'kanban' | 'cards' | 'calendar' | 'timeline';

export interface ViewConfig {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
}

export interface ViewSwitcherProps {
  /** Available views to show */
  views: ViewMode[];
  /** Currently active view */
  activeView: ViewMode;
  /** View change handler */
  onViewChange: (view: ViewMode) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show labels instead of just icons */
  showLabels?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// VIEW CONFIGURATIONS
// =============================================================================

const viewConfigs: Record<ViewMode, ViewConfig> = {
  list: {
    id: 'list',
    label: 'Lista',
    icon: List,
  },
  kanban: {
    id: 'kanban',
    label: 'Kanban',
    icon: Kanban,
  },
  cards: {
    id: 'cards',
    label: 'Cards',
    icon: LayoutGrid,
  },
  calendar: {
    id: 'calendar',
    label: 'Calendário',
    icon: Calendar,
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
    icon: GitBranch,
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ViewSwitcher displays toggle buttons for different view modes.
 * 
 * @example
 * <ViewSwitcher
 *   views={['list', 'kanban', 'cards']}
 *   activeView={viewMode}
 *   onViewChange={setViewMode}
 * />
 */
export function ViewSwitcher({
  views,
  activeView,
  onViewChange,
  size = 'md',
  showLabels = false,
  className,
}: ViewSwitcherProps) {
  const buttonSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  if (views.length === 0) return null;

  return (
    <TooltipProvider>
      <div
        className={cn(
          'inline-flex items-center rounded-md border bg-muted p-1',
          className
        )}
        role="tablist"
        aria-label="Visualizações"
      >
        {views.map((viewId) => {
          const config = viewConfigs[viewId];
          if (!config) return null;

          const Icon = config.icon;
          const isActive = activeView === viewId;

          const button = (
            <Button
              key={viewId}
              variant={isActive ? 'default' : 'ghost'}
              size={buttonSize}
              onClick={() => onViewChange(viewId)}
              className={cn(
                'px-2.5',
                !isActive && 'hover:bg-background'
              )}
              role="tab"
              aria-selected={isActive}
              aria-label={config.label}
            >
              <Icon className={iconSize} />
              {showLabels && (
                <span className="ml-2">{config.label}</span>
              )}
            </Button>
          );

          // Wrap in tooltip if not showing labels
          if (!showLabels) {
            return (
              <Tooltip key={viewId}>
                <TooltipTrigger asChild>
                  {button}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </div>
    </TooltipProvider>
  );
}

// Default export for convenience
export default ViewSwitcher;
