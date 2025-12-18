import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('access_token');
};

const getErrorMessage = (data: ApiErrorResponse | undefined, fallback: string): string => {
  if (data?.error?.message) {
    return data.error.message;
  }

  return fallback;
};

const transformError = (error: AxiosError<ApiErrorResponse>): ApiClientError => {
  if (error.response) {
    const { status, data } = error.response;
    const code = data?.error?.code || 'UNKNOWN_ERROR';

    switch (status) {
      case 400:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Dados invalidos. Verifique o formulario.'),
          data?.error?.details
        );
      case 401:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Sessao expirada. Faca login novamente.'),
          data?.error?.details
        );
      case 403:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Voce nao tem permissao para acessar este recurso.'),
          data?.error?.details
        );
      case 404:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Recurso nao encontrado.'),
          data?.error?.details
        );
      case 409:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Conflito ao processar a solicitacao.'),
          data?.error?.details
        );
      case 422:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Dados invalidos.'),
          data?.error?.details
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Erro no servidor. Tente novamente mais tarde.'),
          data?.error?.details
        );
      default:
        return new ApiClientError(
          status,
          code,
          getErrorMessage(data, 'Erro desconhecido. Tente novamente.'),
          data?.error?.details
        );
    }
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiClientError(0, 'TIMEOUT', 'A requisicao excedeu o tempo limite.');
  }

  return new ApiClientError(
    0,
    'NETWORK_ERROR',
    'Erro de conexao. Verifique sua internet e tente novamente.'
  );
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (!config.headers) {
      config.headers = {};
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => Promise.reject(transformError(error))
);

export { apiClient };
