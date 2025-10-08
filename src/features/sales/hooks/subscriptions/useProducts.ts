/**
 * useProducts Hook
 * 
 * TanStack Query hook for fetching products
 */

import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../api/productsApi';
import { filterActiveProducts, sortProductsByOrder } from '../../services/productService';

/**
 * Query key factory for products
 */
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: string) => [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

/**
 * Hook to fetch all active products
 */
export function useProducts() {
  return useQuery({
    queryKey: productsKeys.lists(),
    queryFn: async () => {
      const products = await fetchProducts();
      // Filter and sort products
      const activeProducts = filterActiveProducts(products);
      return sortProductsByOrder(activeProducts);
    },
    staleTime: 1000 * 60 * 60, // 1 hour - products don't change often
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
    retry: 2,
  });
}

/**
 * Hook to fetch all products (including inactive)
 */
export function useAllProducts() {
  return useQuery({
    queryKey: [...productsKeys.lists(), 'all'],
    queryFn: async () => {
      const products = await fetchProducts();
      return sortProductsByOrder(products);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours cache
    retry: 2,
  });
}
