import { z } from 'zod';
import { healthCheckService } from './health-check';
import { getOrCreateDeviceId } from '@/shared/utils/device';
import type {
  LoginRequest,
  ResetPasswordRequest,
  ConfirmResetPasswordRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  AuthResponse,
  Organization,
  Lead,
  CreateLeadDTO,
  UpdateLeadDTO,
  PaginatedResponse,
  UsageMetrics,
  AnalyticsData,
  ApiKey,
  SearchTerm,
  CreateSearchTerm,
  UpdateSearchTerm,
  SearchTermStats,
  ScrapingJob,
  CreateScrapingJob,
  ScrapingTemplate,
  ScrapingStats,
  WorkerStatus,
  WorkerStats,
  PipelineStage,
  PipelineItem,
  PipelineStats,
  CreatePipelineItem,
  UpdatePipelineItem,
  User,
  Empresa,
  CreateEmpresaDTO,
  Segment,
  SegmentStats,
  CreateSegment,
  UpdateSegment
} from './schemas';
import {
  AuthResponseSchema,
  OrganizationSchema,
  LeadSchema,
  LeadsResponseSchema,
  PaginatedResponseSchema,
  PaginatedApiResponseSchema,
  UsageMetricsSchema,
  AnalyticsDataSchema,
  ApiKeySchema,
  SearchTermSchema,
  SearchTermStatsSchema,
  ScrapingJobSchema,
  ScrapingTemplateSchema,
  ScrapingStatsSchema,
  WorkerStatusSchema,
  WorkerStatsSchema,
  UserSchema,
  EmpresaSchema,
  CreateEmpresaDTOSchema,
  SegmentSchema,
  SegmentStatsSchema,
  PipelineStageSchema,
  PipelineItemSchema,
  PipelineStatsSchema
} from './schemas';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  private refreshCallback: (() => Promise<void>) | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  setOrganizationId(orgId: string | null) {
    this.organizationId = orgId;
  }

  setRefreshCallback(callback: (() => Promise<void>) | null) {
    this.refreshCallback = callback;
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  async request<T>(
    endpoint: string,
    config: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    // Fazer requisições diretas sem health check retry para evitar duplicação
    return this.performRequest(endpoint, config, schema);
  }

  private async performRequest<T>(
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

    // Add device tracking headers for session validation
    const deviceId = getOrCreateDeviceId();
    headers['X-Device-Id'] = deviceId;
    headers['X-Client-Type'] = 'web';

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

        // Handle NO_SUBSCRIPTION error - redirect to pricing
        if (errorData.error === 'NO_SUBSCRIPTION' || errorData.error === 'NO_ACTIVE_SUBSCRIPTION') {
          // Redirect to pricing page
          window.location.href = '/app/pricing';
          throw new ApiError(
            response.status,
            response.statusText,
            errorData.message || 'No active subscription found',
            errorData
          );
        }

        // Handle TRIAL_EXPIRED error - redirect to subscription page
        if (errorData.error === 'TRIAL_EXPIRED') {
          // Redirect to subscription page
          window.location.href = '/app/subscription';
          throw new ApiError(
            response.status,
            response.statusText,
            errorData.message || 'Your trial period has expired. Please subscribe to continue using the service.',
            errorData
          );
        }

        // Handle 401 Unauthorized
        if (response.status === 401) {
          // Check if it's a session validation error (not just expired token)
          const isSessionError = errorData.message?.toLowerCase().includes('sessão') ||
                                  errorData.message?.toLowerCase().includes('session') ||
                                  errorData.error === 'UNAUTHORIZED';

          // If it's a session error, clear everything and redirect to login
          if (isSessionError && !endpoint.includes('/auth/')) {
            console.warn('Session invalid or revoked. Logging out...');

            // Clear tokens but keep device_id
            localStorage.removeItem('leadsrapido_auth_token');
            localStorage.removeItem('leadsrapido_refresh_token');
            localStorage.removeItem('user');
            localStorage.removeItem('empresa');
            localStorage.removeItem('session_id');

            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login?session_expired=true';
            }

            throw new ApiError(
              response.status,
              response.statusText,
              'Sua sessão foi encerrada. Por favor, faça login novamente.',
              errorData
            );
          }

          // Otherwise, try token refresh if available
          if (this.refreshCallback && !endpoint.includes('/auth/')) {
            if (this.isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
              }).then(() => {
                // Retry the request after refresh
                return this.request(endpoint, config, schema);
              });
            }

            this.isRefreshing = true;

            try {
              await this.refreshCallback();
              this.processQueue(null);
              this.isRefreshing = false;

              // Retry the original request with new token
              return this.request(endpoint, config, schema);
            } catch (refreshError) {
              this.processQueue(refreshError as Error);
              this.isRefreshing = false;
              throw refreshError;
            }
          }
        }

        throw new ApiError(
          response.status,
          response.statusText,
          errorData.error || errorData.message || `Request failed with status ${response.status}`,
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
          
          // Log detalhado dos erros de validação
          if (validationError instanceof Error && 'issues' in validationError) {
            console.error('Validation issues:', (validationError as any).issues);
          }
          
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
      
      // Provide user-friendly connectivity error messages
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      const errorMessage = isNetworkError 
        ? healthCheckService.getConnectivityErrorMessage()
        : 'Erro na comunicação com o servidor';
        
      throw new ApiError(0, 'Network Error', errorMessage, error);
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
    // Get sessionId from storage - it's required for the DELETE endpoint
    const sessionId = localStorage.getItem('session_id');

    if (!sessionId) {
      console.warn('No session ID found for logout');
      // Still clear local storage even if no session ID
      return;
    }

    // Use DELETE /api/v1/sessions/{sessionId} endpoint
    return this.request(`/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.request('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmResetPassword(data: ConfirmResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.request('/api/v1/auth/confirm-reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Profile
  async getCurrentUser(): Promise<User> {
    try {
      console.log('Fazendo requisição para /api/v1/users/me');
      const response = await this.request('/api/v1/users/me');
      console.log('Resposta recebida:', response);
      
      // Verificar se a resposta tem o formato esperado
      if (response && typeof response === 'object') {
        const res = response as any; // Type assertion para evitar erros de tipagem
        if (res.success === true && res.data) {
          console.log('Encontrado formato de resposta com envelope success/data');
          // Validar os dados do usuário com o schema
          try {
            const validatedUser = UserSchema.parse(res.data);
            console.log('Dados do usuário validados com sucesso:', validatedUser);
            return validatedUser;
          } catch (validationError) {
            console.error('Erro de validação:', validationError);
            throw new Error('Os dados do usuário não são válidos');
          }
        } else if (res.id && res.email) {
          console.log('Encontrado formato de resposta direta sem envelope');
          // A resposta já é o próprio objeto de usuário
          try {
            const validatedUser = UserSchema.parse(response);
            console.log('Dados do usuário validados com sucesso:', validatedUser);
            return validatedUser;
          } catch (validationError) {
            console.error('Erro de validação:', validationError);
            throw new Error('Os dados do usuário não são válidos');
          }
        }
      }
      
      console.error('Formato de resposta inesperado:', response);
      throw new Error('Formato de resposta inesperado');
    } catch (error) {
      console.error('Erro em getCurrentUser:', error);
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      console.log('Enviando dados para atualizar perfil:', data);
      const response = await this.request('/api/v1/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      console.log('Resposta da atualização de perfil:', response);
      
      if (response && typeof response === 'object') {
        const res = response as any; // Type assertion para evitar erros de tipagem
        if (res.success === true && res.data) {
          try {
            const validatedUser = UserSchema.parse(res.data);
            console.log('Perfil atualizado com sucesso:', validatedUser);
            return validatedUser;
          } catch (validationError) {
            console.error('Erro de validação nos dados atualizados:', validationError);
            throw new Error('Os dados atualizados não são válidos');
          }
        } else if (res.id && res.email) {
          try {
            const validatedUser = UserSchema.parse(response);
            console.log('Perfil atualizado com sucesso:', validatedUser);
            return validatedUser;
          } catch (validationError) {
            console.error('Erro de validação nos dados atualizados:', validationError);
            throw new Error('Os dados atualizados não são válidos');
          }
        }
      }
      
      console.error('Formato de resposta inesperado ao atualizar perfil:', response);
      throw new Error('Formato de resposta inesperado ao atualizar perfil');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    return this.request('/api/v1/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Management (Admin)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    organizationId?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);
    if (params?.organizationId) searchParams.append('organizationId', params.organizationId);
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    const response = await this.request(`/api/v1/users${query}`, {}, PaginatedApiResponseSchema(UserSchema));
    
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

  async getUser(id: string): Promise<User> {
    return this.request(`/api/v1/users/${id}`, {}, UserSchema);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }, UserSchema);
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, UserSchema);
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'DELETE',
    });
  }

  async activateUser(id: string): Promise<User> {
    return this.request(`/api/v1/users/${id}/activate`, {
      method: 'PUT',
    }, UserSchema);
  }

  async deactivateUser(id: string): Promise<User> {
    return this.request(`/api/v1/users/${id}/deactivate`, {
      method: 'PUT',
    }, UserSchema);
  }

  async resetUserPassword(id: string): Promise<{ success: boolean; message: string; temporaryPassword: string }> {
    return this.request(`/api/v1/users/${id}/reset-password`, {
      method: 'POST',
    });
  }

  // // Organizations
  // async getOrganizations(): Promise<Organization[]> {
  //   return this.request('/empresas', {}, z.array(OrganizationSchema));
  // }

  // async getOrganization(id: string): Promise<Organization> {
  //   return this.request(`/empresas/${id}`, {}, OrganizationSchema);
  // }

  // async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
  //   return this.request(`/empresas/${id}`, {
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
    try {
      const searchParams = new URLSearchParams();
      
      // Parâmetros de paginação
      searchParams.append('page', (params?.page || 1).toString());
      searchParams.append('limit', (params?.limit || 20).toString());
      
      // Parâmetros de ordenação - usando valores que a API espera
      searchParams.append('sortBy', params?.sortBy || 'createdAt');
      searchParams.append('sortOrder', params?.sortOrder || 'desc');
      
      // Parâmetros de filtro opcionais
      if (params?.search) {
        searchParams.append('search', params.search);
      }
      if (params?.status && params.status !== 'all') {
        searchParams.append('status', params.status);
      }
      if (params?.scoreMin !== undefined) {
        searchParams.append('scoreMin', params.scoreMin.toString());
      }
      if (params?.scoreMax !== undefined) {
        searchParams.append('scoreMax', params.scoreMax.toString());
      }
      if (params?.segmento) {
        searchParams.append('segmento', params.segmento);
      }
      if (params?.porteEmpresa) {
        searchParams.append('porteEmpresa', params.porteEmpresa);
      }
      if (params?.fonte) {
        searchParams.append('fonte', params.fonte);
      }
      if (params?.tags && params.tags.length > 0) {
        searchParams.append('tags', params.tags.join(','));
      }
      if (params?.createdAfter) {
        searchParams.append('createdAfter', params.createdAfter);
      }
      if (params?.createdBefore) {
        searchParams.append('createdBefore', params.createdBefore);
      }

      const query = searchParams.toString() ? `?${searchParams}` : '';
      const url = `/api/v1/leads${query}`;
      
      const response = await this.request(url, {}, LeadsResponseSchema);

      // Validar a resposta com o schema
      try {
        const validatedData = LeadsResponseSchema.parse(response);
        
        return {
          items: validatedData.data || [],
          total: validatedData.pagination.total || 0,
          page: validatedData.pagination.page || 1,
          limit: validatedData.pagination.limit || 20,
          totalPages: validatedData.pagination.totalPages || 1,
          hasNext: validatedData.pagination.hasNext || false,
          hasPrev: validatedData.pagination.hasPrev || false,
        };
      } catch (schemaError) {
        console.error('❌ Schema validation failed:', {
          error: schemaError,
          response: response,
          expectedFormat: 'LeadsResponseSchema'
        });
        
        // Tentar criar uma resposta válida mesmo com erro de schema
        if (response && typeof response === 'object' && 'data' in response && 'pagination' in response) {
          const res = response as any;
          const fallbackResponse: PaginatedResponse<Lead> = {
            items: Array.isArray(res.data) ? res.data : [],
            total: res.pagination?.total || 0,
            page: res.pagination?.page || 1,
            limit: res.pagination?.limit || 20,
            totalPages: res.pagination?.totalPages || 1,
            hasNext: res.pagination?.hasNext || false,
            hasPrev: res.pagination?.hasPrev || false,
          };
          
          return fallbackResponse;
        }
        
        throw schemaError;
      }

    } catch (error) {
      console.error('❌ API Request Failed:', {
        error,
        params,
        url: `/api/v1/leads`,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        500,
        'Internal Server Error',
        error instanceof Error ? error.message : 'Erro na comunicação com o servidor'
      );
    }
  }

  async getLead(id: string): Promise<Lead> {
    const response = await this.request<{ success: boolean; data: Lead }>(
      `/api/v1/leads/${id}`,
      {},
      z.object({
        success: z.boolean(),
        data: LeadSchema,
        timestamp: z.string().optional(),
        trace: z.any().optional(),
      })
    );
    return response.data;
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

  // Empresas
  async getEmpresas(params?: {
    page?: number;
    limit?: number;
    search?: string;
    segmento?: string;
  }): Promise<PaginatedResponse<Empresa>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.segmento) searchParams.append('segmento', params.segmento);

    const query = searchParams.toString() ? `?${searchParams}` : '';

    // The API returns { success: true, data: Empresa[] } instead of paginated response
    const response = await this.request(`/api/v1/empresas${query}`, {}, z.object({
      success: z.boolean(),
      data: z.array(EmpresaSchema)
    }));

    const empresas = response.data;
    return {
      items: empresas || [],
      total: empresas?.length || 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: Math.ceil((empresas?.length || 0) / (params?.limit || 20)),
      hasNext: false,
      hasPrev: false,
    };
  }

  async getEmpresa(id: string): Promise<Empresa> {
    return this.request(`/api/v1/empresas/${id}`, {}, EmpresaSchema);
  }

  async getEmpresasStats(): Promise<{
    total: number;
    prospects: number;
    conversionRate: number;
    today: number;
  }> {
    return this.request('/api/v1/empresas/stats', {});
  }

  async createEmpresa(data: CreateEmpresaDTO): Promise<Empresa> {
    return this.request('/api/v1/empresas', {
      method: 'POST',
      body: JSON.stringify(data),
    }, EmpresaSchema);
  }

  async updateEmpresa(id: string, data: CreateEmpresaDTO): Promise<Empresa> {
    return this.request(`/api/v1/empresas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, EmpresaSchema);
  }

  async deleteEmpresa(id: string): Promise<void> {
    return this.request(`/api/v1/empresas/${id}`, {
      method: 'DELETE',
    });
  }

  // Segments
  async getSegments(params?: {
    timeRange?: string;
  }): Promise<Segment[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.timeRange) searchParams.append('timeRange', params.timeRange);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    return this.request(`/api/v1/segments${query}`, {}, z.array(SegmentSchema));
  }

  async getSegment(id: string): Promise<Segment> {
    return this.request(`/api/v1/segments/${id}`, {}, SegmentSchema);
  }

  async getSegmentStats(params?: {
    timeRange?: string;
  }): Promise<SegmentStats> {
    const searchParams = new URLSearchParams();
    
    if (params?.timeRange) searchParams.append('timeRange', params.timeRange);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    return this.request(`/api/v1/segments/stats${query}`, {}, SegmentStatsSchema);
  }

  async createSegment(data: CreateSegment): Promise<Segment> {
    return this.request('/api/v1/segments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, SegmentSchema);
  }

  async updateSegment(id: string, data: UpdateSegment): Promise<Segment> {
    return this.request(`/api/v1/segments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, SegmentSchema);
  }

  async deleteSegment(id: string): Promise<void> {
    return this.request(`/api/v1/segments/${id}`, {
      method: 'DELETE',
    });
  }

  // Pipeline
  async getPipelineStages(): Promise<PipelineStage[]> {
    return this.request('/api/v1/pipeline/stages', {}, z.array(PipelineStageSchema));
  }

  async getPipelineItems(params?: {
    stageId?: string;
    responsavelId?: string;
    timeRange?: string;
  }): Promise<PipelineItem[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.stageId) searchParams.append('stageId', params.stageId);
    if (params?.responsavelId) searchParams.append('responsavelId', params.responsavelId);
    if (params?.timeRange) searchParams.append('timeRange', params.timeRange);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    return this.request(`/api/v1/pipeline/items${query}`, {}, z.array(PipelineItemSchema));
  }

  async getPipelineStats(params?: {
    timeRange?: string;
  }): Promise<PipelineStats> {
    const searchParams = new URLSearchParams();
    
    if (params?.timeRange) searchParams.append('timeRange', params.timeRange);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    return this.request(`/api/v1/pipeline/stats${query}`, {}, PipelineStatsSchema);
  }

  async createPipelineItem(data: CreatePipelineItem): Promise<PipelineItem> {
    return this.request('/api/v1/pipeline/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }, PipelineItemSchema);
  }

  async updatePipelineItem(id: string, data: UpdatePipelineItem): Promise<PipelineItem> {
    return this.request(`/api/v1/pipeline/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, PipelineItemSchema);
  }

  async movePipelineItem(id: string, newStageId: string): Promise<PipelineItem> {
    return this.request(`/api/v1/pipeline/items/${id}/move`, {
      method: 'PUT',
      body: JSON.stringify({ stageId: newStageId }),
    }, PipelineItemSchema);
  }

  async deletePipelineItem(id: string): Promise<void> {
    return this.request(`/api/v1/pipeline/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Search Terms
  async getSearchTerms(params?: {
    page?: number;
    limit?: number;
    categoria?: string;
    ativo?: boolean;
    search?: string;
  }): Promise<PaginatedResponse<SearchTerm>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.categoria) searchParams.append('categoria', params.categoria);
    if (params?.ativo !== undefined) searchParams.append('ativo', params.ativo.toString());
    if (params?.search) searchParams.append('search', params.search);

    const query = searchParams.toString() ? `?${searchParams}` : '';
    
    const response = await this.request(`/api/v1/search-terms${query}`, {}, PaginatedApiResponseSchema(SearchTermSchema));
    
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

  async getSearchTerm(id: string): Promise<SearchTerm> {
    return this.request(`/api/v1/search-terms/${id}`, {}, SearchTermSchema);
  }

  async createSearchTerm(data: CreateSearchTerm): Promise<SearchTerm> {
    return this.request('/api/v1/search-terms', {
      method: 'POST',
      body: JSON.stringify(data),
    }, SearchTermSchema);
  }

  async updateSearchTerm(id: string, data: UpdateSearchTerm): Promise<SearchTerm> {
    return this.request(`/api/v1/search-terms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, SearchTermSchema);
  }

  async deleteSearchTerm(id: string): Promise<void> {
    return this.request(`/api/v1/search-terms/${id}`, {
      method: 'DELETE',
    });
  }

  async getSearchTermCategories(): Promise<string[]> {
    const response = await this.request('/api/v1/search-terms/categories', {}, z.object({
      data: z.array(z.string())
    }));
    return response.data;
  }

  async getSearchTermStats(): Promise<SearchTermStats[]> {
    const response = await this.request('/api/v1/search-terms/stats', {}, z.object({
      data: z.array(SearchTermStatsSchema)
    }));
    return response.data;
  }

  // Google Maps Scraping
  async getScrapingStatus(): Promise<WorkerStatus> {
    const response = await this.request('/api/v1/scraping/status', {}, z.object({
      data: WorkerStatusSchema
    }));
    return response.data;
  }

  async startScraping(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/v1/scraping/start', {
      method: 'POST',
    });
  }

  async stopScraping(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/v1/scraping/stop', {
      method: 'POST',
    });
  }

  // Note: Backend doesn't have GET /scraping/jobs endpoint, only POST
  async getScrapingJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<ScrapingJob>> {
    // Since backend doesn't provide this endpoint, return empty response
    console.warn('GET /scraping/jobs endpoint not available in backend');
    return {
      items: [],
      total: 0,
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    };
  }

  async createScrapingJob(data: CreateScrapingJob): Promise<ScrapingJob> {
    const response = await this.request('/api/v1/scraping/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }, z.object({
      success: z.boolean(),
      data: ScrapingJobSchema,
      message: z.string().optional()
    }));
    return response.data;
  }

  async createBulkScrapingJobs(jobs: CreateScrapingJob[]): Promise<ScrapingJob[]> {
    return this.request('/api/v1/scraping/jobs/bulk', {
      method: 'POST',
      body: JSON.stringify({ jobs }),
    }, z.array(ScrapingJobSchema));
  }

  async createSegmentedScrapingJob(segmento: string, localizacoes: string[]): Promise<ScrapingJob[]> {
    return this.request('/api/v1/scraping/jobs/segmented', {
      method: 'POST',
      body: JSON.stringify({ segmento, localizacoes }),
    }, z.array(ScrapingJobSchema));
  }

  async getScrapingStats(): Promise<ScrapingStats> {
    try {
      // Try with a more flexible schema first to see what the API returns
      const response = await this.request('/api/v1/scraping/stats', {}, z.object({
        data: z.record(z.any()).transform((data): ScrapingStats => ({
          totalJobs: data.totalJobs ?? 0,
          jobsAtivos: data.jobsAtivos ?? 0,
          jobsConcluidos: data.jobsConcluidos ?? 0,
          totalLeadsColetados: data.totalLeadsColetados ?? 0,
          leadsHoje: data.leadsHoje ?? 0,
          taxaSucesso: data.taxaSucesso ?? 0,
          tempoMedioExecucao: data.tempoMedioExecucao ?? 0,
          ultimaExecucao: data.ultimaExecucao ?? undefined,
        }))
      }));
      return response.data;
    } catch (error) {
      console.log('GET /scraping/stats endpoint error:', error);

      // Mock data para desenvolvimento
      const mockStats: ScrapingStats = {
        totalJobs: 0,
        jobsAtivos: 0,
        jobsConcluidos: 0,
        totalLeadsColetados: 0,
        leadsHoje: 0,
        taxaSucesso: 0,
        tempoMedioExecucao: 0,
        ultimaExecucao: undefined,
      };

      return mockStats;
    }
  }

  async getScrapingTemplates(): Promise<ScrapingTemplate[]> {
    return this.request('/api/v1/scraping/templates', {}, z.array(ScrapingTemplateSchema));
  }

  // Worker Status
  async getWorkerStatus(workerName: string): Promise<WorkerStatus> {
    return this.request(`/api/v1/workers/${workerName}/status`, {}, WorkerStatusSchema);
  }

  async getWorkerStats(workerName: string): Promise<WorkerStats> {
    return this.request(`/api/v1/workers/${workerName}/stats`, {}, WorkerStatsSchema);
  }

  // Lead Processing
  async startLeadProcessing(data?: {
    batchSize?: number;
    maxConcurrency?: number;
    filters?: Record<string, unknown>;
  }): Promise<{ success: boolean; data: { jobId: string }; message: string }> {
    return this.request('/api/v1/leads/processing/start', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getLeadProcessingStatus(empresaId: string): Promise<{
    success: boolean;
    data: {
      isRunning: boolean;
      totalLeads: number;
      processedLeads: number;
      pendingLeads: number;
      errorLeads: number;
    };
    message: string;
  }> {
    return this.request(`/api/v1/leads/processing/status/${empresaId}`);
  }

  async getLeadProcessingReport(empresaId: string, periodoEmDias: number = 30): Promise<{
    success: boolean;
    data: {
      periodo: {
        inicio: string;
        fim: string;
      };
      estatisticas: {
        totalProcessados: number;
        sucessos: number;
        erros: number;
        tempoMedioProcessamento: number;
      };
    };
    message: string;
  }> {
    return this.request(`/api/v1/leads/processing/report/${empresaId}?periodoEmDias=${periodoEmDias}`);
  }

  async getStuckLeads(empresaId: string, minutosMinimos: number = 30): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      nome: string;
      status: string;
      tempoTravado: number;
      ultimaAtualizacao: string;
    }>;
  }> {
    return this.request(`/api/v1/leads/processing/stuck/${empresaId}?minutosMinimos=${minutosMinimos}`);
  }

  async resetStuckLeads(minutosMinimos: number): Promise<{
    success: boolean;
    data: {
      leadsResetados: number;
    };
    message: string;
  }> {
    return this.request('/api/v1/leads/processing/reset-stuck', {
      method: 'POST',
      body: JSON.stringify({ minutosMinimos }),
    });
  }

  // ========== Métodos auxiliares para compatibilidade ==========
  
  /**
   * Método auxiliar para requisições GET
   */
  async get<T = any>(url: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(url, { method: 'GET' }, schema);
  }

  /**
   * Método auxiliar para requisições POST
   */
  async post<T = any>(url: string, data?: any, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    }, schema);
  }

  /**
   * Método auxiliar para requisições PUT
   */
  async put<T = any>(url: string, data?: any, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, schema);
  }

  /**
   * Método auxiliar para requisições PATCH
   */
  async patch<T = any>(url: string, data?: any, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, schema);
  }

  /**
   * Método auxiliar para requisições DELETE
   */
  async delete<T = any>(url: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request<T>(url, { method: 'DELETE' }, schema);
  }

  /**
   * Obtém o token de acesso atual
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
export { ApiError };