import { useCallback, useState } from 'react';
import type { OpportunityFilters } from '../types/opportunity';

export function useOpportunityFilters(initialFilters: OpportunityFilters = {}) {
  const [filters, setFilters] = useState<OpportunityFilters>(initialFilters);

  const updateFilter = useCallback(<K extends keyof OpportunityFilters>(key: K, value: OpportunityFilters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
  };
}
