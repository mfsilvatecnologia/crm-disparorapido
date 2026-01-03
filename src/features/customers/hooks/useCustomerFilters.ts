import { useCallback, useState } from 'react';
import type { CustomerFilters } from '../types/customer';

export function useCustomerFilters(initialFilters: CustomerFilters = {}) {
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

  const updateFilter = useCallback(<K extends keyof CustomerFilters>(key: K, value: CustomerFilters[K]) => {
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
