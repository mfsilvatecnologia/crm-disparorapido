/**
 * useGoogleLogin Hook
 * 
 * Hook para gerenciar o fluxo de login com Google OAuth.
 * Usa Supabase para OAuth e envia o token para o backend.
 */

import { useState, useCallback } from 'react';
import { signInWithGoogle, getSupabaseSession, clearSupabaseSession } from '@/lib/supabase-auth';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Resposta do endpoint /auth/google/callback
 */
export interface GoogleLoginResponse {
  success: boolean;
  data: {
    token: string;
    refresh_token?: string;
    user: {
      id: string;
      email: string;
      empresa_id: string | null;
      roles: string[];
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
  };
  error?: string;
}

/**
 * Estado do hook
 */
interface GoogleLoginState {
  loading: boolean;
  error: string | null;
}

/**
 * Hook para login com Google
 * 
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { initiateGoogleLogin, processCallback, loading, error } = useGoogleLogin();
 * 
 *   return (
 *     <button onClick={initiateGoogleLogin} disabled={loading}>
 *       {loading ? 'Conectando...' : 'Login com Google'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useGoogleLogin() {
  const [state, setState] = useState<GoogleLoginState>({
    loading: false,
    error: null,
  });

  /**
   * Inicia o fluxo de OAuth com Google
   * Redireciona o usuário para a página de login do Google
   */
  const initiateGoogleLogin = useCallback(async () => {
    setState({ loading: true, error: null });

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setState({ loading: false, error: error.message });
        return;
      }

      // O usuário será redirecionado para o Google
      // O loading permanece true até o redirect
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : 'Erro ao iniciar login com Google',
      });
    }
  }, []);

  /**
   * Processa o callback do OAuth
   * Obtém o token do Supabase e envia para o backend
   * 
   * @returns Dados do usuário autenticado ou erro
   */
  const processCallback = useCallback(async (): Promise<GoogleLoginResponse | null> => {
    setState({ loading: true, error: null });

    try {
      // 1. Obtém o access_token da sessão do Supabase
      const { accessToken, error: sessionError } = await getSupabaseSession();

      if (sessionError || !accessToken) {
        throw new Error(sessionError?.message || 'Sessão não encontrada após autenticação');
      }

      // 2. Prepara dados do dispositivo
      const deviceId = getOrCreateDeviceId();
      const deviceFingerprint = await generateDeviceFingerprint('web');

      // 3. Envia o token para o backend
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          device_id: deviceId,
          device_fingerprint: deviceFingerprint,
          client_type: 'web',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro ${response.status}: ${response.statusText}`);
      }

      // 4. NÃO limpa a sessão do Supabase aqui
      // Ela será limpa APÓS o loginWithGoogle() completar com sucesso
      // Isso garante que os tokens estejam armazenados antes de limpar

      // 5. Tokens serão armazenados pelo AuthContext.loginWithGoogle()
      // Não armazenamos aqui para evitar duplicação

      setState({ loading: false, error: null });
      return data as GoogleLoginResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar login com Google';
      setState({ loading: false, error: errorMessage });

      // Limpa sessão do Supabase em caso de erro
      await clearSupabaseSession();

      return null;
    }
  }, []);

  /**
   * Limpa o estado de erro
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    initiateGoogleLogin,
    processCallback,
    clearError,
    loading: state.loading,
    error: state.error,
  };
}

export default useGoogleLogin;
