/**
 * Authentication Context
 * Provides authentication state and methods to the application
 * Implements T029 from tasks.md
 */

import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react';
import type { User, JWTPayload } from '../types/auth';
import { authStorage } from '@/shared/utils/storage';
import { decodeJWT, isTokenExpired } from '@/shared/utils/token';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';
import type { LoginRequest, LoginResponse } from '../contracts/auth-contracts';
import type { SessionLimitError } from '@/shared/services/schemas';
import { tokenRefreshManager } from '../services/tokenRefreshService';

/**
 * Session Limit Error type for when max sessions is reached
 */
export class SessionLimitExceededError extends Error {
  constructor(public data: SessionLimitError['data']) {
    super('SESSION_LIMIT_EXCEEDED');
    this.name = 'SessionLimitExceededError';
  }
}

/**
 * Auth Context Value Interface
 */
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
  subscription?: {
    id: string;
    status: string;
    isActive: boolean;
  } | null;
  is_new_user: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  sessionLimitError: SessionLimitError['data'] | null;
  clearSessionLimitError: () => void;
}

/**
 * Auth Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Manages authentication state and provides auth methods to children
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionLimitError, setSessionLimitError] = useState<SessionLimitError['data'] | null>(null);

  /**
   * Refresh User Data
   * Fetches updated user information from token
   */
  const refreshUser = useCallback(async () => {
    try {
      const token = authStorage.getAccessToken();

      if (!token || isTokenExpired(token)) {
        setUser(null);
        return;
      }

      const payload: JWTPayload = decodeJWT(token);

      const userData: User = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        empresa_id: payload.empresa_id,
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  }, []);

  /**
   * Logout Method
   * Clears auth state and tokens
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Call logout API (best effort - don't fail if it errors)
      try {
        const token = authStorage.getAccessToken();
        if (token) {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ device_id: deviceId }),
          });
        }
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      // Para o gerenciador de refresh
      tokenRefreshManager.stop();

      // Clear local state regardless of API call result
      authStorage.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initialize auth state from localStorage
   * Runs once on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authStorage.getAccessToken();

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
          // Token is expired, try to refresh or clear
          authStorage.clearTokens();
          setIsLoading(false);
          return;
        }

        // Decode token to get user info
        const payload: JWTPayload = decodeJWT(token);

        // Create user object from token payload
        const userData: User = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          empresa_id: payload.empresa_id,
          ativo: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setUser(userData);

        // Inicia o gerenciador de refresh automático
        tokenRefreshManager.start(
          (newToken) => {
            console.log('[Auth] Token refreshed automaticamente');
            // Atualiza o user com o novo token
            refreshUser();
          },
          (error) => {
            console.error('[Auth] Erro no refresh automático:', error);
            // Em caso de erro no refresh, faz logout
            logout();
          }
        );
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup: para o refresh manager quando o componente desmontar
    return () => {
      tokenRefreshManager.stop();
    };
  }, [refreshUser, logout]);

  /**
   * Login Method
   * Authenticates user and stores tokens
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Get device info
      const deviceId = getOrCreateDeviceId();
      const deviceFingerprint = await generateDeviceFingerprint('web');

      // Prepare login request
      const loginRequest: LoginRequest = {
        email,
        password,
        device_id: deviceId,
        device_fingerprint: deviceFingerprint,
        client_type: 'web',
      };

      // Call login API
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));

        // Handle SESSION_LIMIT_EXCEEDED (409)
        if (response.status === 409 && errorData.error === 'SESSION_LIMIT_EXCEEDED') {
          setSessionLimitError(errorData.data);
          throw new SessionLimitExceededError(errorData.data);
        }

        throw new Error(errorData.error || errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Store tokens
      authStorage.setAccessToken(data.data.token);
      authStorage.setRefreshToken(data.data.refresh_token);
      authStorage.setSessionId(data.data.session.id);
      authStorage.updateLastActivity();

      // Set user from response
      setUser(data.data.user);

      // Inicia o gerenciador de refresh automático após login bem-sucedido
      tokenRefreshManager.start(
        (newToken) => {
          console.log('[Auth] Token refreshed automaticamente');
          refreshUser();
        },
        (error) => {
          console.error('[Auth] Erro no refresh automático:', error);
          logout();
        }
      );
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser, logout]);

  /**
   * Login with Google OAuth
   * Processes Google OAuth response and updates auth state
   */
  const loginWithGoogle = useCallback(async (data: GoogleLoginData) => {
    setIsLoading(true);

    try {
      // Store tokens
      authStorage.setAccessToken(data.token);
      if (data.refresh_token) {
        authStorage.setRefreshToken(data.refresh_token);
      }
      if (data.session?.id) {
        authStorage.setSessionId(data.session.id);
      }
      authStorage.updateLastActivity();

      // Convert backend user data to User type
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        nome: data.user.user_metadata?.full_name,
        role: data.user.roles[0] || data.user.user_metadata?.role || 'usuario',
        empresa_id: data.user.empresa_id || '',
        ativo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Set user state
      setUser(userData);

      // Start token refresh manager
      tokenRefreshManager.start(
        (newToken) => {
          console.log('[Auth] Token refreshed automaticamente');
          refreshUser();
        },
        (error) => {
          console.error('[Auth] Erro no refresh automático:', error);
          logout();
        }
      );
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshUser, logout]);

  /**
   * Clear session limit error
   */
  const clearSessionLimitError = useCallback(() => {
    setSessionLimitError(null);
  }, []);

  /**
   * Context Value
   */
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    refreshUser,
    sessionLimitError,
    clearSessionLimitError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Custom hook to access auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
