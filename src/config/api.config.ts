/**
 * API Configuration per Tenant
 * 
 * Handles different API endpoints and configurations for each tenant
 */

import { TenantId } from '@/config/tenants/types';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

/**
 * API configurations per tenant
 */
const API_CONFIGS: Record<TenantId, ApiConfig> = {
  'vendas': {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://api.vendas.ia.br' 
               : 'http://localhost:3000'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  publix: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://api.publix.ia.br' 
               : 'http://localhost:3000'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  'disparorapido': {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://api.disparorapido.ia.br' 
               : 'http://localhost:3000'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
    ph3a: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://api.ph3a.cd2.io' 
               : 'http://localhost:3000'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  'lean': {
    baseURL: import.meta.env.VITE_API_BASE_URL || 
             (process.env.NODE_ENV === 'production' 
               ? 'https://api.leanquality.com.br' 
               : 'http://localhost:3000'),
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },

};

/**
 * Fallback configuration when API is not available
 */
const FALLBACK_CONFIG: ApiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  retries: 1,
  retryDelay: 500
};

/**
 * Get API configuration for a specific tenant
 */
export function getApiConfig(tenantId: TenantId): ApiConfig {
  return API_CONFIGS[tenantId] || FALLBACK_CONFIG;
}

/**
 * Get the current API base URL from environment or tenant config
 */
export function getApiBaseUrl(tenantId?: TenantId): string {
  // First priority: environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Second priority: tenant-specific config
  if (tenantId) {
    return getApiConfig(tenantId).baseURL;
  }
  
  // Fallback
  return FALLBACK_CONFIG.baseURL;
}

/**
 * Check if API is available
 */
export async function checkApiHealth(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}

/**
 * Auto-detect the best API endpoint
 */
export async function detectApiEndpoint(tenantId: TenantId): Promise<string> {
  // First priority: respect environment variable if set
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl) {
    console.log(`[API] Using environment API URL: ${envApiUrl}`);
    return envApiUrl;
  }
  
  // Second priority: tenant-specific configuration
  const config = getApiConfig(tenantId);
  
  // Try tenant-specific endpoint
  const isHealthy = await checkApiHealth(config.baseURL);
  if (isHealthy) {
    console.log(`[API] Using tenant API endpoint: ${config.baseURL}`);
    return config.baseURL;
  }
  
  // Try fallback endpoints only if environment URL is not set
  const fallbackUrls = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8000',
  ];
  
  for (const url of fallbackUrls) {
    if (await checkApiHealth(url)) {
      console.log(`[API] Using fallback API endpoint: ${url}`);
      return url;
    }
  }
  
  // If all fail, return the original config (mocks will handle this)
  console.warn('[API] No healthy API endpoint found, falling back to mocks');
  return config.baseURL;
}

export default {
  getApiConfig,
  getApiBaseUrl,
  checkApiHealth,
  detectApiEndpoint,
};