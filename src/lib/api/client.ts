import { z } from 'zod';
import type { 
  LoginRequest, 
  AuthResponse, 
  Organization, 
  Lead, 
  LeadFilter, 
  LeadAccess,
  PaginatedResponse,
  UsageMetrics,
  AnalyticsData,
  ApiKey
} from './schemas';
import { 
  AuthResponseSchema, 
  OrganizationSchema, 
  LeadSchema, 
  PaginatedResponseSchema,
  UsageMetricsSchema,
  AnalyticsDataSchema,
  ApiKeySchema
} from './schemas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private organizationId: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setOrganizationId(orgId: string | null) {
    this.organizationId = orgId;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    if (this.organizationId) {
      headers['X-Org-Id'] = this.organizationId;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        
        throw new ApiError(
          response.status,
          response.statusText,
          errorData.message || `Request failed with status ${response.status}`,
          errorData
        );
      }

      const data = await response.json();
      
      // Validate response with schema if provided
      if (schema) {
        return schema.parse(data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network Error', 'Failed to make request', error);
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock login for testing - remove when backend is ready
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          organizationId: 'org-1',
          role: 'admin'
        }
      };
    }
    throw new ApiError(401, 'Unauthorized', 'Invalid credentials');
    
    // Original implementation - uncomment when backend is ready
    // return this.request('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // }, AuthResponseSchema);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, AuthResponseSchema);
  }

  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Organizations
  async getOrganizations(): Promise<Organization[]> {
    // Mock organizations for testing
    return [
      {
        id: 'org-1',
        name: 'Test Organization',
        description: 'Organization for testing',
        plan: 'professional',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    // return this.request('/api/v1/organizations', {}, z.array(OrganizationSchema));
  }

  async getOrganization(id: string): Promise<Organization> {
    // Mock single organization for testing
    return {
      id: 'org-1',
      name: 'Test Organization',
      description: 'Organization for testing',
      plan: 'professional',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // return this.request(`/api/v1/organizations/${id}`, {}, OrganizationSchema);
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    return this.request(`/api/v1/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, OrganizationSchema);
  }

  async getUsageMetrics(orgId: string, period?: { from: string; to: string }): Promise<UsageMetrics> {
    const params = new URLSearchParams();
    if (period) {
      params.append('from', period.from);
      params.append('to', period.to);
    }
    const query = params.toString() ? `?${params}` : '';
    
    return this.request(`/api/v1/organizations/${orgId}/usage${query}`, {}, UsageMetricsSchema);
  }

  // Leads
  async getLeads(params?: {
    page?: number;
    pageSize?: number;
    filter?: LeadFilter;
    sort?: string;
  }): Promise<PaginatedResponse<Lead>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    const query = searchParams.toString() ? `?${searchParams}` : '';
    const response = await this.request(`/api/v1/leads${query}`);
    
    // Validate the structure manually since the generic schema is causing issues
    if (!response || typeof response !== 'object' || !('data' in response) || !('pagination' in response)) {
      throw new Error('Invalid response format from leads endpoint');
    }
    
    return response as PaginatedResponse<Lead>;
  }

  async getLead(id: string): Promise<Lead> {
    return this.request(`/api/v1/leads/${id}`, {}, LeadSchema);
  }

  async accessLead(id: string): Promise<LeadAccess> {
    return this.request(`/api/v1/leads/${id}/access`, {
      method: 'POST',
    });
  }

  async bulkAccessLeads(ids: string[]): Promise<LeadAccess[]> {
    return this.request('/api/v1/leads/bulk-access', {
      method: 'POST',
      body: JSON.stringify({ leadIds: ids }),
    });
  }

  async exportLeads(filter?: LeadFilter): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
      });
    }

    const query = searchParams.toString() ? `?${searchParams}` : '';
    const response = await fetch(`${this.baseURL}/api/v1/leads/export${query}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Org-Id': this.organizationId || '',
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, 'Export failed');
    }

    return response.blob();
  }

  // Analytics
  async getAnalytics(period: { from: string; to: string }): Promise<AnalyticsData[]> {
    const params = new URLSearchParams({
      from: period.from,
      to: period.to,
    });
    
    return this.request(`/api/v1/analytics?${params}`, {}, z.array(AnalyticsDataSchema));
  }

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    return this.request('/api/v1/api-keys', {}, z.array(ApiKeySchema));
  }

  async createApiKey(data: { name: string; permissions: string[] }): Promise<ApiKey> {
    return this.request('/api/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    }, ApiKeySchema);
  }

  async revokeApiKey(id: string): Promise<void> {
    return this.request(`/api/v1/api-keys/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
export { ApiError };