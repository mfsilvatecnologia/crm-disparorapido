/**
 * General API Client Configuration
 * 
 * Centralized axios instance for backend API communication
 * with authentication, error handling, and interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response) {
          const { status, data } = error.response;

          // Handle specific HTTP status codes
          switch (status) {
            case 401:
              // Unauthorized - clear token and redirect to login
              this.setAccessToken(null);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:unauthorized'));
              }
              throw new ApiClientError(
                401,
                data?.error?.code || 'UNAUTHORIZED',
                data?.error?.message || 'Sessão expirada. Faça login novamente.',
                data?.error?.details
              );

            case 403:
              throw new ApiClientError(
                403,
                data?.error?.code || 'FORBIDDEN',
                data?.error?.message || 'Você não tem permissão para acessar este recurso.',
                data?.error?.details
              );

            case 404:
              throw new ApiClientError(
                404,
                data?.error?.code || 'NOT_FOUND',
                data?.error?.message || 'Recurso não encontrado.',
                data?.error?.details
              );

            case 422:
              throw new ApiClientError(
                422,
                data?.error?.code || 'VALIDATION_ERROR',
                data?.error?.message || 'Dados inválidos.',
                data?.error?.details
              );

            case 429:
              throw new ApiClientError(
                429,
                data?.error?.code || 'RATE_LIMIT',
                data?.error?.message || 'Muitas requisições. Tente novamente em alguns segundos.',
                data?.error?.details
              );

            case 500:
            case 502:
            case 503:
            case 504:
              throw new ApiClientError(
                status,
                data?.error?.code || 'SERVER_ERROR',
                data?.error?.message || 'Erro no servidor. Tente novamente mais tarde.',
                data?.error?.details
              );

            default:
              throw new ApiClientError(
                status,
                data?.error?.code || 'UNKNOWN_ERROR',
                data?.error?.message || 'Erro desconhecido. Tente novamente.',
                data?.error?.details
              );
          }
        }

        // Network error or request timeout
        if (error.code === 'ECONNABORTED') {
          throw new ApiClientError(
            0,
            'TIMEOUT',
            'A requisição demorou muito tempo. Verifique sua conexão.'
          );
        }

        throw new ApiClientError(
          0,
          'NETWORK_ERROR',
          'Erro de conexão. Verifique sua internet e tente novamente.'
        );
      }
    );
  }

  /**
   * Set the access token for authenticated requests
   */
  public setAccessToken(token: string | null) {
    this.accessToken = token;
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
      }
    }
  }

  /**
   * Get the current access token
   */
  public getAccessToken(): string | null {
    if (!this.accessToken && typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('access_token');
    }
    return this.accessToken;
  }

  /**
   * Get the configured Axios instance
   */
  public getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  public async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Initialize token from localStorage on startup
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('access_token');
  if (token) {
    apiClient.setAccessToken(token);
  }
}

export default apiClient;
