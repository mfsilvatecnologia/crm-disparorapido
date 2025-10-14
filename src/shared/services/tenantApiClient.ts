/**
 * Robust API Client with Tenant Support
 * 
 * Handles CORS issues, connection failures, and tenant-specific configurations
 */

import React from 'react';
import { useTenant } from '@/shared/contexts/TenantContext';
import { getApiConfig, detectApiEndpoint, checkApiHealth } from '@/config/api.config';
import { authStorage } from '@/shared/utils/storage';
import { isTokenExpired } from '@/shared/utils/token';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiConnectionError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'ApiConnectionError';
  }
}

class TenantApiClient {
  private baseUrl: string = '';
  private isInitialized: boolean = false;
  private retryAttempts: number = 0;
  private maxRetries: number = 3;

  async initialize(tenantId: string) {
    if (this.isInitialized) return;

    try {
      console.log(`[ApiClient] Initializing for tenant: ${tenantId}`);
      
      // Try to detect the best API endpoint
      this.baseUrl = await detectApiEndpoint(tenantId as any);
      const config = getApiConfig(tenantId as any);
      this.maxRetries = config.retries;
      
      console.log(`[ApiClient] Using API endpoint: ${this.baseUrl}`);
      this.isInitialized = true;
    } catch (error) {
      console.error('[ApiClient] Initialization failed:', error);
      // Fallback to environment variable
      this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      this.isInitialized = true;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = authStorage.getAccessToken();
    
    // Check token expiration
    if (token && isTokenExpired(token)) {
      console.warn('[ApiClient] Token expired, request may fail');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    try {
      console.log(`[ApiClient] Making request to: ${url}`);
      
      const response = await fetch(url, requestOptions);
      
      // Handle different types of responses
      if (!response.ok) {
        // Try to get error details from response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
        }

        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || `Request failed with status ${response.status}`,
            details: errorData,
          },
        };
      }

      // Handle successful response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: true,
        data,
      };

    } catch (error) {
      console.error(`[ApiClient] Request failed:`, error);
      
      // Handle specific error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: {
            code: 'CONNECTION_ERROR',
            message: 'Unable to connect to the API server. Please check your connection.',
            details: { originalError: error.message },
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          details: { originalError: error },
        },
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Health check method
  async checkHealth(): Promise<boolean> {
    if (!this.isInitialized) return false;
    return checkApiHealth(this.baseUrl);
  }

  // Get current API status
  getStatus() {
    return {
      baseUrl: this.baseUrl,
      isInitialized: this.isInitialized,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries,
    };
  }
}

// Create singleton instance
const apiClient = new TenantApiClient();

/**
 * Hook to get initialized API client for current tenant
 */
export function useApiClient() {
  const { tenant } = useTenant();
  
  // Initialize client for current tenant if not already done
  React.useEffect(() => {
    if (tenant?.id) {
      apiClient.initialize(tenant.id);
    }
  }, [tenant?.id]);

  return apiClient;
}

/**
 * Direct API client access (make sure to initialize first)
 */
export { apiClient };

/**
 * Legacy compatibility layer
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get the raw response from our API client
  const method = options.method || 'GET';
  const endpoint = url.startsWith('/api') ? url : `/api/v1${url}`;
  
  let result;
  switch (method.toUpperCase()) {
    case 'GET':
      result = await apiClient.get(endpoint, options);
      break;
    case 'POST':
      result = await apiClient.post(endpoint, options.body ? JSON.parse(options.body as string) : undefined, options);
      break;
    case 'PUT':
      result = await apiClient.put(endpoint, options.body ? JSON.parse(options.body as string) : undefined, options);
      break;
    case 'DELETE':
      result = await apiClient.delete(endpoint, options);
      break;
    case 'PATCH':
      result = await apiClient.patch(endpoint, options.body ? JSON.parse(options.body as string) : undefined, options);
      break;
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
  
  // Convert our ApiResponse back to a Response-like object for compatibility
  if (result.success) {
    return new Response(JSON.stringify(result.data), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify(result.error), {
      status: result.error?.code.includes('HTTP_') ? parseInt(result.error.code.replace('HTTP_', '')) : 500,
      statusText: 'Error',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default apiClient;