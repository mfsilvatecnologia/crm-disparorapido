export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | null;
  fetchFn?: typeof fetch;
}

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const defaultGetToken = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  } catch (_err) {
    return null;
  }
};

const defaultBaseUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : '/api';

export const createApiClient = (options: ApiClientOptions = {}) => {
  const baseUrl = options.baseUrl ?? defaultBaseUrl;
  const fetchFn = options.fetchFn ?? fetch;
  const getToken = options.getToken ?? defaultGetToken;

  const buildUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  };

  const request = async <TResponse, TBody = unknown>(
    path: string,
    init: RequestInit & { body?: TBody | null } = {}
  ): Promise<TResponse> => {
    const url = buildUrl(path);
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };

    const response = await fetchFn(url, {
      ...init,
      headers,
      body: init.body !== undefined && init.body !== null ? JSON.stringify(init.body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json().catch(() => undefined) : await response.text();

    if (!response.ok) {
      throw new ApiError('API request failed', response.status, data);
    }

    return data as TResponse;
  };

  return {
    get: <TResponse>(path: string, init?: RequestInit) => request<TResponse>(path, { ...init, method: 'GET' }),
    post: <TResponse, TBody = unknown>(path: string, body?: TBody, init?: RequestInit) =>
      request<TResponse, TBody>(path, { ...init, method: 'POST', body: body ?? null }),
    patch: <TResponse, TBody = unknown>(path: string, body?: TBody, init?: RequestInit) =>
      request<TResponse, TBody>(path, { ...init, method: 'PATCH', body: body ?? null }),
  };
};

export const apiClient = createApiClient();
