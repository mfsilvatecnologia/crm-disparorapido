/**
 * QuickFilters Component
 * 
 * Displays a row of filter buttons for quick filtering.
 * Each button can show an optional count badge.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React from 'react';
import { cn } from '@/shared/utils/utils';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { LucideIcon } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface QuickFilterOption {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional count to display */
  count?: number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Custom color (Tailwind class) */
  color?: string;
}

export interface QuickFiltersProps {
  /** Available filter options */
  options: QuickFilterOption[];
  /** Currently selected option(s) */
  selected?: string | string[];
  /** Selection change handler */
  onChange: (selected: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show "All" option */
  showAll?: boolean;
  /** Label for "All" option */
  allLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * QuickFilters displays filter buttons with optional counts.
 * 
 * @example
 * // Single selection
 * <QuickFilters
 *   options={[
 *     { id: 'novo', label: 'Novos', count: 12 },
 *     { id: 'qualificado', label: 'Qualificados', count: 8 },
 *   ]}
 *   selected={selectedStatus}
 *   onChange={setSelectedStatus}
 * />
 * 
 * @example
 * // Multiple selection
 * <QuickFilters
 *   options={statusOptions}
 *   selected={selectedStatuses}
 *   onChange={setSelectedStatuses}
 *   multiple
 *   showAll
 * />
 */
export function QuickFilters({
  options,
  selected,
  onChange,
  multiple = false,
  size = 'md',
  showAll = true,
  allLabel = 'Todos',
  className,
}: QuickFiltersProps) {
  // Normalize selected to array for easier handling
  const selectedArray = Array.isArray(selected) 
    ? selected 
    : selected ? [selected] : [];

  const isSelected = (id: string) => selectedArray.includes(id);
  const isAllSelected = selectedArray.length === 0;

  const handleSelect = (id: string) => {
    if (multiple) {
      const newSelected = isSelected(id)
        ? selectedArray.filter(s => s !== id)
        : [...selectedArray, id];
      onChange(newSelected);
    } else {
      onChange(isSelected(id) ? '' : id);
    }
  };

  const handleSelectAll = () => {
    onChange(multiple ? [] : '');
  };

  const buttonSize = size === 'sm' ? 'sm' : 'default';

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* "All" button */}
      {showAll && (
        <Button
          variant={isAllSelected ? 'default' : 'outline'}
          size={buttonSize}
          onClick={handleSelectAll}
          className="relative"
        >
          {allLabel}
        </Button>
      )}

      {/* Filter options */}
      {options.map((option) => {
        const Icon = option.icon;
        const active = isSelected(option.id);

        return (
          <Button
            key={option.id}
            variant={active ? 'default' : 'outline'}
            size={buttonSize}
            onClick={() => handleSelect(option.id)}
            className={cn(
              'relative',
              option.color && !active && option.color
            )}
          >
            {Icon && <Icon className="mr-1.5 h-4 w-4" />}
            {option.label}
            {option.count !== undefined && option.count > 0 && (
              <Badge
                variant={active ? 'secondary' : 'outline'}
                className="ml-2 min-w-[1.5rem] justify-center"
              >
                {option.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}

// Default export for convenience
export default QuickFilters;
