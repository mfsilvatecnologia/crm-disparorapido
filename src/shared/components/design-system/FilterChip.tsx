/**
 * FilterChip Component
 * 
 * A dropdown filter chip that allows selecting one or more options.
 * Shows selected values as chips when collapsed.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { useState } from 'react';
import { cn } from '@/shared/utils/utils';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Checkbox } from '@/shared/components/ui/checkbox';

// =============================================================================
// TYPES
// =============================================================================

export interface FilterChipOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Optional count */
  count?: number;
}

export interface FilterChipProps {
  /** Chip label (displayed when collapsed) */
  label: string;
  /** Available options */
  options: FilterChipOption[];
  /** Currently selected value(s) */
  selected?: string | string[];
  /** Selection change handler */
  onChange: (selected: string | string[]) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Enable search within dropdown */
  searchable?: boolean;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * FilterChip displays a dropdown for filtering options.
 * 
 * @example
 * // Single selection
 * <FilterChip
 *   label="Segmento"
 *   options={[
 *     { value: 'tech', label: 'Tecnologia', count: 45 },
 *     { value: 'retail', label: 'Varejo', count: 23 },
 *   ]}
 *   selected={selectedSegment}
 *   onChange={setSelectedSegment}
 * />
 * 
 * @example
 * // Multiple selection with search
 * <FilterChip
 *   label="Tags"
 *   options={tagOptions}
 *   selected={selectedTags}
 *   onChange={setSelectedTags}
 *   multiple
 *   searchable
 * />
 */
export function FilterChip({
  label,
  options,
  selected,
  onChange,
  multiple = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  className,
}: FilterChipProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize selected to array
  const selectedArray = Array.isArray(selected) 
    ? selected 
    : selected ? [selected] : [];

  // Filter options by search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected option labels for display
  const selectedLabels = options
    .filter(opt => selectedArray.includes(opt.value))
    .map(opt => opt.label);

  const hasSelection = selectedArray.length > 0;

  const handleSelect = (value: string) => {
    if (multiple) {
      const newSelected = selectedArray.includes(value)
        ? selectedArray.filter(v => v !== value)
        : [...selectedArray, value];
      onChange(newSelected);
    } else {
      onChange(value);
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange(selectedArray.filter(v => v !== value));
    } else {
      onChange('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between min-w-[120px]',
            hasSelection && 'border-primary',
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {hasSelection ? (
              <>
                {multiple && selectedArray.length > 1 ? (
                  <Badge variant="secondary" className="rounded-sm px-1.5 font-normal">
                    {selectedArray.length} selecionados
                  </Badge>
                ) : (
                  <span className="truncate">{selectedLabels[0]}</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{label}</span>
            )}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {hasSelection && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        {/* Search input */}
        {searchable && (
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0"
            />
          </div>
        )}

        {/* Options list */}
        <div className="max-h-[300px] overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedArray.includes(option.value);
              
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent'
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {multiple ? (
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                  ) : (
                    <Check
                      className={cn(
                        'h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-muted-foreground text-xs">
                      {option.count}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected chips (multiple mode) */}
        {multiple && hasSelection && (
          <div className="border-t p-2 flex flex-wrap gap-1">
            {selectedArray.slice(0, 3).map((value) => {
              const option = options.find(o => o.value === value);
              if (!option) return null;
              
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="rounded-sm pr-1"
                >
                  {option.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => handleRemove(value, e)}
                  />
                </Badge>
              );
            })}
            {selectedArray.length > 3 && (
              <Badge variant="secondary" className="rounded-sm">
                +{selectedArray.length - 3}
              </Badge>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Default export for convenience
export default FilterChip;
