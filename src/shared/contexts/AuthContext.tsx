import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './SessionContext';
import { getOrCreateDeviceId, getDeviceFingerprint, clearDeviceData } from '../utils/device';
import type { User, ComputedPermissions, LoginCredentials, ClientType } from '../types';
import apiClient from '../services/client';
import { fetchUserPermissions } from '../../features/authentication/services/permissions';
import type { AuthResponse } from '../types/schemas';

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
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
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token';
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'leadsrapido_refresh_token';
const USER_KEY = 'user';
const EMPRESA_KEY = 'empresa';

// Create query client with permissions-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
  const queryClientInstance = useQueryClient();

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const userData = localStorage.getItem(USER_KEY);
        const empresaData = localStorage.getItem(EMPRESA_KEY);

        if (savedToken && userData && savedRefreshToken) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setToken(savedToken);
          setRefreshToken(savedRefreshToken);
          apiClient.setAccessToken(savedToken);

          // Load empresa if available
          if (empresaData) {
            const parsedEmpresa = JSON.parse(empresaData);
            setEmpresa(parsedEmpresa);
          }

          // Fetch and set permissions
          const permissionsResponse = await fetchUserPermissions(savedToken);
          setPermissions(permissionsResponse.data.permissions);
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
    try {
      setIsLoading(true);

      // Add device information for session management
      const deviceId = getOrCreateDeviceId();
      const fingerprint = getDeviceFingerprint();
      const clientType: ClientType = getClientType();

      const loginData = {
        email: credentials.email,
        password: credentials.password,
        device_id: deviceId,
        device_fingerprint: fingerprint,
        client_type: clientType
      };

      const response: AuthResponse = await apiClient.login(loginData);

      // Store tokens and user data
      const accessToken = response.data.token || response.data.access_token;
      const userRefreshToken = response.data.refresh_token;

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      if (userRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, userRefreshToken);
      }

      // Store empresa data if available
      if (response.data.empresa) {
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
        setEmpresa(response.data.empresa);
      }

      // Update API client and state
      apiClient.setAccessToken(accessToken);
      setUser(response.data.user);
      setToken(accessToken);
      setRefreshToken(userRefreshToken || null);

      // Fetch and set permissions
      const permissionsResponse = await fetchUserPermissions(accessToken);
      setPermissions(permissionsResponse.data.permissions);
    } catch (error) {
      console.error('Login failed:', error);
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

      // Reset API client and state
      apiClient.setAccessToken(null);
      setUser(null);
      setEmpresa(null);
      setToken(null);
      setRefreshToken(null);
      setPermissions(null);

      // Clear device data and query cache
      clearDeviceData();
      queryClient.clear();
    }
  };

  const refreshAuth = async () => {
    if (!refreshToken) {
      console.warn('No refresh token available for auth refresh');
      return;
    }

    try {
      console.log('Refreshing authentication token...');
      const response: AuthResponse = await apiClient.refresh(refreshToken);

      // Update tokens and user data
      const newAccessToken = response.data.token || response.data.access_token;
      const newRefreshToken = response.data.refresh_token;

      if (newAccessToken) {
        localStorage.setItem(TOKEN_KEY, newAccessToken);
        apiClient.setAccessToken(newAccessToken);
        setToken(newAccessToken);
      }

      if (newRefreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        setRefreshToken(newRefreshToken);
      }

      // Update user data if provided
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        setUser(response.data.user);
      }

      // Update empresa data if provided
      if (response.data.empresa) {
        localStorage.setItem(EMPRESA_KEY, JSON.stringify(response.data.empresa));
        setEmpresa(response.data.empresa);
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
    logout,
    refreshAuth,
    refreshPermissions,
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
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return 'extension';
  }
  if (window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'moz-extension:') {
    return 'extension';
  }
  return 'web';
}