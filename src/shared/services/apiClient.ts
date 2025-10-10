/**
 * API Client with Authentication
 *
 * Provides authenticated fetch wrapper that automatically injects
 * Authorization header and handles 401 responses for token refresh.
 */

import { authStorage } from '../utils/storage';
import { isTokenExpired } from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Authenticated fetch wrapper
 * Automatically adds Authorization header and handles 401 responses
 *
 * @param url - API endpoint (relative to base URL or absolute)
 * @param options - Fetch options
 * @returns Response from the API
 *
 * @example
 * ```typescript
 * const response = await authenticatedFetch('/api/sessions/active');
 * const data = await response.json();
 * ```
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authStorage.getAccessToken();

  // Build full URL if relative path provided
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  // Check if token is expired before making request
  if (token && isTokenExpired(token)) {
    // Token is expired, attempt refresh
    // Note: This creates a circular dependency that needs to be handled
    // by the calling code (authService.refreshAccessToken)
    console.warn('Token expired, 401 response expected');
  }

  // Make request with Authorization header
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  // Handle 401 Unauthorized - token refresh needed
  if (response.status === 401) {
    // Clear expired/invalid tokens
    authStorage.clearTokens();

    // Redirect to login or trigger refresh
    // The calling code should handle this by catching the error
    // and either refreshing the token or redirecting to login
    const error = new Error('Unauthorized - token expired or invalid');
    (error as any).status = 401;
    throw error;
  }

  return response;
}

/**
 * Make authenticated GET request
 *
 * @param url - API endpoint
 * @returns Parsed JSON response
 */
export async function authenticatedGet<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make authenticated POST request
 *
 * @param url - API endpoint
 * @param data - Request body
 * @returns Parsed JSON response
 */
export async function authenticatedPost<T = any>(
  url: string,
  data?: any
): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make authenticated DELETE request
 *
 * @param url - API endpoint
 * @returns Parsed JSON response
 */
export async function authenticatedDelete<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`DELETE ${url} failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Make authenticated PUT request
 *
 * @param url - API endpoint
 * @param data - Request body
 * @returns Parsed JSON response
 */
export async function authenticatedPut<T = any>(
  url: string,
  data?: any
): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`PUT ${url} failed: ${response.status}`);
  }

  return response.json();
}
