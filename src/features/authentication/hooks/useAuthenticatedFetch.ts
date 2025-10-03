/**
 * useAuthenticatedFetch Hook
 * Provides a fetch wrapper that automatically includes authentication headers
 * Implements T037 from tasks.md
 */

import { useCallback } from 'react';
import { authStorage } from '@/shared/utils/storage';
import { useAuth } from './useAuth';

/**
 * Hook to create an authenticated fetch function
 * Automatically adds Authorization header with access token
 *
 * @returns Authenticated fetch function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const authFetch = useAuthenticatedFetch();
 *
 *   const fetchData = async () => {
 *     const response = await authFetch('/api/users');
 *     const data = await response.json();
 *     return data;
 *   };
 *
 *   return <button onClick={fetchData}>Fetch Data</button>;
 * }
 * ```
 */
export function useAuthenticatedFetch() {
  const { logout } = useAuth();

  /**
   * Authenticated fetch wrapper
   * Adds Authorization header and handles 401 responses
   */
  const authenticatedFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = authStorage.getAccessToken();

      // Prepare headers
      const headers: HeadersInit = {
        ...options.headers,
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.warn('Unauthorized request - logging out');
        await logout();
        throw new Error('Unauthorized - please login again');
      }

      return response;
    },
    [logout]
  );

  return authenticatedFetch;
}

/**
 * Type for authenticated fetch function
 */
export type AuthenticatedFetch = ReturnType<typeof useAuthenticatedFetch>;
