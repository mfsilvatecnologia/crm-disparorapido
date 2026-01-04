import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './SessionContext';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';
import type { User, ComputedPermissions, LoginCredentials } from '../types';
import { ClientType } from '@/features/authentication/types/auth';
import apiClient from '../services/client';
import { apiClient as libApiClient } from '@/lib/api-client';
import type { AuthResponse, SessionLimitError } from '../services/schemas';

/**
 * Session Limit Error type for when max sessions is reached
 */
export class SessionLimitExceededError extends Error {
  constructor(public data: SessionLimitError['data']) {
    super('SESSION_LIMIT_EXCEEDED');
    this.name = 'SessionLimitExceededError';
  }
}

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
}

export interface GoogleLoginData {
  token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    empresa_id: string | null;
    roles: string[];
    user_metadata?: {
      full_name?: string;
      role?: string;
      oauth_provider?: string;
    };
  };
  empresa: {
    id: string;
    nome: string;
    cnpj: string;
  } | null;
  session?: {
    id: string;
    device_id: string;
    expires_at: string;
  };
  is_new_user: boolean;
}

interface AuthContextType {
  user: User | null;
  empresa: Empresa | null;
  token: string | null;
  refreshToken: string | null;
  permissions: ComputedPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  sessionLimitError: SessionLimitError['data'] | null;
  clearSessionLimitError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'leadsrapido_refresh_token';
const USER_KEY = 'user';
const EMPRESA_KEY = 'empresa';

// Create query client with permissions-optimized settings
const shouldRetry = (failureCount: number, error: unknown) => {
  const status = (error as { status?: number; response?: { status?: number } })?.status
    ?? (error as { response?: { status?: number } })?.response?.status;

  if (status && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < 2;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<ComputedPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionLimitError, setSessionLimitError] = useState<SessionLimitError['data'] | null>(null);
  const queryClientInstance = useQueryClient();

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_KEY);
        const empresaData = localStorage.getItem(EMPRESA_KEY);

        if (savedToken && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setToken(savedToken);
          setRefreshToken(savedRefreshToken); // Pode ser null
          apiClient.setAccessToken(savedToken);
          libApiClient.setAccessToken(savedToken); // Sync with lib api client

          // Load empresa if available
          if (empresaData) {
            const parsedEmpresa = JSON.parse(empresaData);
            setEmpresa(parsedEmpresa);
          }

          // TODO: Implementar sistema de permissões quando backend estiver pronto
          setPermissions({} as ComputedPermissions);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid stored data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(EMPRESA_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up refresh callback for API client
  useEffect(() => {
    apiClient.setRefreshCallback(refreshAuth);
    return () => {
      apiClient.setRefreshCallback(null);
    };
  }, [refreshToken]);

  const login = async (credentials: LoginCredentials) => {
    // Add device information for session management (moved outside try to be accessible in catch)
    const deviceId = getOrCreateDeviceId();
    const fingerprint = await generateDeviceFingerprint('web');
    const clientType: ClientType = getClientType();

    try {
      setIsLoading(true);

      const loginData = {
        email: credentials.email,
        password: credentials.password,
        device_id: deviceId,
        device_fingerprint: fingerprint,
        client_type: clientType
      };

      const response: AuthResponse = await apiClient.login(loginData);

      // Check subscription status before proceeding
      if (response.data.subscription && !response.data.subscription.isActive) {
        // Store tokens temporarily for the redirect
        const accessToken = response.data.token;
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

        if (response.data.empresa) {
          localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
        }

        // Update API client
        apiClient.setAccessToken(accessToken);
        libApiClient.setAccessToken(accessToken);

        // Set user state to allow navigation
        setUser({
          ...response.data.user,
          created_at: response.data.user.createdAt || new Date().toISOString(),
          updated_at: response.data.user.updatedAt || new Date().toISOString(),
        } as User);
        setToken(accessToken);
        setEmpresa(response.data.empresa ? {
          id: response.data.empresa.id,
          nome: response.data.empresa.nome,
          cnpj: response.data.empresa.cnpj,
        } : null);

        // Store subscription info for redirect
        localStorage.setItem('subscription_redirect', 'true');

        setIsLoading(false);

        // Throw error to trigger redirect in LoginPage
        throw new Error('NO_ACTIVE_SUBSCRIPTION');
      }

      // Store tokens and user data
      const accessToken = response.data.token;

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      // Store session ID if available
      if (response.data.session?.id) {
        localStorage.setItem('session_id', response.data.session.id);
      }

      // Store empresa data if available
      if (response.data.empresa) {
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
        setEmpresa({
          id: response.data.empresa.id,
          nome: response.data.empresa.nome,
          cnpj: response.data.empresa.cnpj,
        });
      }

      // Update API client and state
      apiClient.setAccessToken(accessToken);
      libApiClient.setAccessToken(accessToken); // Sync with lib api client
      setUser({
        ...response.data.user,
        created_at: response.data.user.createdAt || new Date().toISOString(),
        updated_at: response.data.user.updatedAt || new Date().toISOString(),
      } as User);
      setToken(accessToken);
      setRefreshToken(null); // API não retorna refresh token no login

      // TODO: Implementar sistema de permissões quando backend estiver pronto
      setPermissions({} as ComputedPermissions);
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error details:', {
        status: error?.status,
        data: error?.data,
        name: error?.name,
        message: error?.message
      });

      // Handle SESSION_LIMIT_EXCEEDED (409) - Auto force login without modal
      if (error?.status === 409 && (error?.data?.error === 'SESSION_LIMIT_EXCEEDED' || error?.message === 'SESSION_LIMIT_EXCEEDED')) {
        try {
          const sessionData = error?.data?.data;
          const managementToken = sessionData?.management_token;
          const activeSessions = sessionData?.active_sessions || [];

          if (!managementToken || activeSessions.length === 0) {
            setSessionLimitError(error.data.data);
            throw new SessionLimitExceededError(error.data.data);
          }

          // Get the first active session (or the current one if identifiable)
          const sessionToClose = activeSessions[0];

          // Use the management token to close the session
          try {
            await apiClient.request(`/api/v1/sessions/${sessionToClose.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${managementToken}`,
              },
              body: JSON.stringify({
                device_id: deviceId,
                reason: 'AUTO_REPLACE_SESSION',
                revoked_by: credentials.email,
              }),
            });
          } catch (deleteError) {
            // If deletion fails, show modal as fallback
            setSessionLimitError(error.data.data);
            throw new SessionLimitExceededError(error.data.data);
          }

          // Clear local session data
          localStorage.removeItem('session_id');

          // Now try to login again with same device info
          const retryLoginData = {
            email: credentials.email,
            password: credentials.password,
            device_id: deviceId,
            device_fingerprint: fingerprint,
            client_type: clientType,
          };

          const response: AuthResponse = await apiClient.login(retryLoginData);

          // Store tokens and user data
          const accessToken = response.data.token;

          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

          // Store session ID if available
          if (response.data.session?.id) {
            localStorage.setItem('session_id', response.data.session.id);
          }

          // Store empresa data if available
          if (response.data.empresa) {
            localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
            setEmpresa({
              id: response.data.empresa.id,
              nome: response.data.empresa.nome,
              cnpj: response.data.empresa.cnpj,
            });
          }

          // Update API client and state
          apiClient.setAccessToken(accessToken);
          libApiClient.setAccessToken(accessToken);
          setUser({
            ...response.data.user,
            created_at: response.data.user.createdAt || new Date().toISOString(),
            updated_at: response.data.user.updatedAt || new Date().toISOString(),
          } as User);
          setToken(accessToken);
          setRefreshToken(null);

          // TODO: Implementar sistema de permissões quando backend estiver pronto
          setPermissions({} as ComputedPermissions);

          return; // Exit successfully
        } catch (forceLoginError) {
          // If force login fails, show the modal as fallback
          setSessionLimitError(error.data.data);
          throw new SessionLimitExceededError(error.data.data);
        }
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSessionLimitError = () => {
    setSessionLimitError(null);
  };

  const loginWithGoogle = async (data: GoogleLoginData) => {
    setIsLoading(true);

    try {
      // Store tokens
      const accessToken = data.token;
      localStorage.setItem(TOKEN_KEY, accessToken);
      
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        setRefreshToken(data.refresh_token);
      }
      
      if (data.session?.id) {
        localStorage.setItem('session_id', data.session.id);
      }

      // Store empresa data if available
      if (data.empresa) {
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(data.empresa));
        setEmpresa({
          id: data.empresa.id,
          nome: data.empresa.nome,
          cnpj: data.empresa.cnpj,
        });
      }

      // Update API client and state
      apiClient.setAccessToken(accessToken);
      libApiClient.setAccessToken(accessToken); // Sync with lib api client
      
      // Convert backend user data to User type
      setUser({
        id: data.user.id,
        email: data.user.email,
        nome: data.user.user_metadata?.full_name,
        role: data.user.roles[0] || data.user.user_metadata?.role || 'usuario',
        empresa_id: data.user.empresa_id || '',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as User);
      
      setToken(accessToken);

      // TODO: Implementar sistema de permissões quando backend estiver pronto
      setPermissions({} as ComputedPermissions);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear all stored data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(EMPRESA_KEY);
      localStorage.removeItem('session_id'); // Clear session ID

      // Reset API client and state
      apiClient.setAccessToken(null);
      libApiClient.setAccessToken(null); // Sync with lib api client
      setUser(null);
      setEmpresa(null);
      setToken(null);
      setRefreshToken(null);
      setPermissions(null);

      // IMPORTANT: Do NOT clear device_id during logout
      // The device_id must persist across logins to properly track device sessions
      // Only clear query cache
      queryClient.clear();
    }
  };

  const refreshAuth = async () => {
    if (!refreshToken) {
      console.warn('No refresh token available for auth refresh');
      // Fazer logout quando não há refresh token para evitar loop infinito
      await logout();
      throw new Error('No refresh token available');
    }

    try {
      console.log('Refreshing authentication token...');
      const response: AuthResponse = await apiClient.refresh(refreshToken);

      // Update tokens and user data
      const newAccessToken = response.data.token;

      if (newAccessToken) {
        localStorage.setItem(TOKEN_KEY, newAccessToken);
        apiClient.setAccessToken(newAccessToken);
        libApiClient.setAccessToken(newAccessToken); // Sync with lib api client
        setToken(newAccessToken);
      }

      // Update user data if provided
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        setUser({
          ...response.data.user,
          created_at: response.data.user.created_at || response.data.user.createdAt || new Date().toISOString(),
          updated_at: response.data.user.updated_at || response.data.user.updatedAt || new Date().toISOString(),
        } as User);
      }

      // Update empresa data if provided
      if (response.data.empresa) {
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
        setEmpresa({
          id: response.data.empresa.id,
          nome: response.data.empresa.nome,
          cnpj: response.data.empresa.cnpj,
        });
      }

      // Invalidate related queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      await queryClient.invalidateQueries({ queryKey: ['permissions'] });

      console.log('Authentication token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh authentication token:', error);

      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  const refreshPermissions = async () => {
    if (token) {
      await queryClient.invalidateQueries({ queryKey: ['permissions'] });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;

    // Map permission strings to computed permissions
    const permissionMap: Record<string, boolean> = {
      'users.create': permissions.canCreateUsers,
      'users.edit': permissions.canEditUsers,
      'users.delete': permissions.canDeleteUsers,
      'leads.view': permissions.canViewAllLeads,
      'leads.create': permissions.canCreateLeads,
      'leads.edit': permissions.canEditLeads,
      'leads.delete': permissions.canDeleteLeads,
      'campaigns.manage': permissions.canManageCampaigns,
      'reports.view': permissions.canViewReports,
      'admin.access': permissions.canAccessAdmin,
      'sessions.manage': permissions.canManageSessions,
      'audit.view': permissions.canViewAuditLogs,
    };

    return permissionMap[permission] || false;
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    empresa,
    token,
    refreshToken,
    permissions,
    isAuthenticated,
    isLoading,
    hasPermission,
    hasRole,
    login,
    loginWithGoogle,
    logout,
    refreshAuth,
    refreshPermissions,
    sessionLimitError,
    clearSessionLimitError,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthContext.Provider value={value}>
          {children}
        </AuthContext.Provider>
      </SessionProvider>
    </QueryClientProvider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to determine client type
function getClientType(): ClientType {
  // Check if running in Chrome extension context
  if (typeof window !== 'undefined') {
    const globalThis = window as any;
    if (globalThis.chrome?.runtime?.id) {
      return ClientType.EXTENSION;
    }
    if (window.location.protocol === 'chrome-extension:' ||
        window.location.protocol === 'moz-extension:') {
      return ClientType.EXTENSION;
    }
  }
  return ClientType.WEB;
}
