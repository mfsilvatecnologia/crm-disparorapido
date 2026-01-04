/**
 * Toolbar Component
 * 
 * A compound component that organizes search, filters, view switcher, and actions
 * in a consistent horizontal layout.
 * 
 * @package leadsrapido-crm
 * @feature 002-crm-ui-modernization
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '@/shared/utils/utils';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';

// =============================================================================
// TYPES
// =============================================================================

export interface ToolbarProps {
  children: ReactNode;
  className?: string;
}

export interface ToolbarSearchProps {
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms (handled by consumer) */
  className?: string;
}

export interface ToolbarFiltersProps {
  children: ReactNode;
  className?: string;
}

export interface ToolbarViewSwitcherProps {
  children: ReactNode;
  className?: string;
}

export interface ToolbarActionsProps {
  children: ReactNode;
  className?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

interface ToolbarContextValue {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

function useToolbarContext() {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('Toolbar compound components must be used within a Toolbar');
  }
  return context;
}

// =============================================================================
// TOOLBAR ROOT
// =============================================================================

/**
 * Toolbar root component that provides context for child components.
 * 
 * @example
 * <Toolbar>
 *   <Toolbar.Search placeholder="Buscar leads..." />
 *   <Toolbar.Filters>
 *     <QuickFilters options={statusOptions} />
 *   </Toolbar.Filters>
 *   <Toolbar.ViewSwitcher>
 *     <ViewSwitcher views={['list', 'kanban']} />
 *   </Toolbar.ViewSwitcher>
 *   <Toolbar.Actions>
 *     <Button>Novo Lead</Button>
 *   </Toolbar.Actions>
 * </Toolbar>
 */
function ToolbarRoot({ children, className }: ToolbarProps) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <ToolbarContext.Provider value={{ searchValue, setSearchValue }}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 py-3',
          className
        )}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
}

// =============================================================================
// TOOLBAR SEARCH
// =============================================================================

function ToolbarSearch({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: ToolbarSearchProps) {
  const context = useToolbarContext();
  
  // Use controlled value if provided, otherwise use context
  const currentValue = value ?? context.searchValue;
  const handleChange = useCallback((newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      context.setSearchValue(newValue);
    }
  }, [onChange, context]);

  const handleClear = () => {
    handleChange('');
  };

  return (
    <div className={cn('relative flex-1 min-w-[200px] max-w-md', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {currentValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar busca</span>
        </Button>
      )}
    </div>
  );
}

// =============================================================================
// TOOLBAR FILTERS
// =============================================================================

function ToolbarFilters({ children, className }: ToolbarFiltersProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// TOOLBAR VIEW SWITCHER
// =============================================================================

function ToolbarViewSwitcherContainer({ children, className }: ToolbarViewSwitcherProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// TOOLBAR ACTIONS
// =============================================================================

function ToolbarActions({ children, className }: ToolbarActionsProps) {
  return (
    <div className={cn('flex items-center gap-2 ml-auto', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// TOOLBAR SEPARATOR
// =============================================================================

function ToolbarSeparator({ className }: { className?: string }) {
  return (
    <div className={cn('h-6 w-px bg-border mx-2', className)} />
  );
}

// =============================================================================
// COMPOUND COMPONENT EXPORT
// =============================================================================

export const Toolbar = Object.assign(ToolbarRoot, {
  Search: ToolbarSearch,
  Filters: ToolbarFilters,
  ViewSwitcher: ToolbarViewSwitcherContainer,
  Actions: ToolbarActions,
  Separator: ToolbarSeparator,
});

// Default export
export default Toolbar;
