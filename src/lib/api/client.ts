import { z } from 'zod';

import { 
  AuthResponseSchema, 
  OrganizationSchema, 
  LeadSchema, 
  PaginatedResponseSchema,
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
  }  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, AuthResponseSchema);
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
    return this.request('/api/v1/empresas', {}, z.array(OrganizationSchema));
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request(`/api/v1/empresas/${id}`, {}, OrganizationSchema);
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    return this.request(`/api/v1/empresas/${id}`, {
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

    const query = searchParams.toString() ? `?${searchParams}` : '';
    const response = await this.request(`/api/v1/leads${query}`, {}, PaginatedResponseSchema(LeadSchema));
    return response;
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