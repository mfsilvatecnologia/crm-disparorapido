import { z } from 'zod';
import type {
  LoginRequest,
  AuthResponse,
  Organization,
  Lead,
  CreateLeadDTO,
  UpdateLeadDTO,
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
  PaginatedApiResponseSchema,
  UsageMetricsSchema,
  AnalyticsDataSchema,
  ApiKeySchema
} from './schemas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown
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

  async request<T>(
    endpoint: string,
    config: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ensure proper headers for JSON requests
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      ...(config.headers as Record<string, string> || {}),
    };

    // Add authorization header if token is available
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const requestConfig = {
      ...config,
      headers,
    };

    console.log('API Request:', {
      url,
      method: requestConfig.method || 'GET',
      headers: requestConfig.headers,
      body: requestConfig.body ? JSON.parse(requestConfig.body as string) : undefined
    });

    try {
      const response = await fetch(url, requestConfig);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('API Error Response:', errorData);
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
      console.log('API Success Response:', data);
      
      // Validate response with schema if provided
      if (schema) {
        try {
          console.log('Validating response with schema:', data);
          return schema.parse(data);
        } catch (validationError) {
          console.error('Schema validation failed:', {
            error: validationError,
            receivedData: data
          });
          throw validationError;
        }
      }
      
      return data;
    } catch (error) {
      console.error('API Request Failed:', {
        url,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network Error', 'Request failed', error);
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, AuthResponseSchema);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }, AuthResponseSchema);
  }

  async logout(): Promise<void> {
    return this.request('/api/v1/auth/logout', {
      method: 'POST',
    });
  }

  // // Organizations
  // async getOrganizations(): Promise<Organization[]> {
  //   return this.request('/api/v1/empresas', {}, z.array(OrganizationSchema));
  // }

  // async getOrganization(id: string): Promise<Organization> {
  //   return this.request(`/api/v1/empresas/${id}`, {}, OrganizationSchema);
  // }

  // async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
  //   return this.request(`/api/v1/empresas/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(data),
  //   }, OrganizationSchema);
  // }

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
    limit?: number;
    status?: string;
    scoreMin?: number;
    scoreMax?: number;
    segmento?: string;
    porteEmpresa?: string;
    fonte?: string;
    search?: string;
    tags?: string[];
    createdAfter?: string;
    createdBefore?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Lead>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.scoreMin) searchParams.append('scoreMin', params.scoreMin.toString());
    if (params?.scoreMax) searchParams.append('scoreMax', params.scoreMax.toString());
    if (params?.segmento) searchParams.append('segmento', params.segmento);
    if (params?.porteEmpresa) searchParams.append('porteEmpresa', params.porteEmpresa);
    if (params?.fonte) searchParams.append('fonte', params.fonte);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','));
    if (params?.createdAfter) searchParams.append('createdAfter', params.createdAfter);
    if (params?.createdBefore) searchParams.append('createdBefore', params.createdBefore);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    const response = await this.request(`/api/v1/leads${query}`, {}, PaginatedApiResponseSchema(LeadSchema));
    
    // Extract and ensure the data matches our expected type
    const data = response.data;
    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 20,
      totalPages: data.totalPages || 0,
      hasNext: data.hasNext || false,
      hasPrev: data.hasPrev || false,
    };
  }

  async getLead(id: string): Promise<Lead> {
    return this.request(`/api/v1/leads/${id}`, {}, LeadSchema);
  }

  async createLead(data: CreateLeadDTO): Promise<Lead> {
    return this.request('/api/v1/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    }, LeadSchema);
  }

  async updateLead(id: string, data: UpdateLeadDTO): Promise<Lead> {
    return this.request(`/api/v1/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, LeadSchema);
  }

  async deleteLead(id: string): Promise<void> {
    return this.request(`/api/v1/leads/${id}`, {
      method: 'DELETE',
    });
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