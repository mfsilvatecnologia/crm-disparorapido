/**
 * useProduct Hook
 * 
 * TanStack Query hook for fetching a single product by ID
 */

import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '../../api/productsApi';

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => {
      if (!productId) {
        throw new Error('Product ID is required');
      }
      return fetchProductById(productId);
    },
    enabled: !!productId, // Only run if productId exists
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache
    retry: 2,
  });
}
