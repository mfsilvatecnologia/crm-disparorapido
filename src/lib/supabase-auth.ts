/**
 * Supabase Auth Client
 * 
 * Cliente Supabase configurado APENAS para OAuth (Google Login).
 * O restante da autenticação é gerenciado pelo backend via API.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase Auth] Variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não configuradas. ' +
    'O login com Google não funcionará.'
  );
}

/**
 * Cliente Supabase singleton para OAuth
 */
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false, // Não precisamos de refresh - usamos tokens do backend
        persistSession: false,   // Não persistimos sessão do Supabase
        detectSessionInUrl: true, // Detecta callback do OAuth
      },
    });
  }

  return supabaseClient;
}

/**
 * Inicia o fluxo de OAuth com Google
 * 
 * @param redirectTo - URL para redirecionar após autenticação (default: /auth/callback)
 * @returns Promise com resultado do OAuth ou erro
 */
export async function signInWithGoogle(redirectTo?: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      error: new Error('Supabase não configurado. Verifique as variáveis de ambiente.'),
    };
  }

  const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Obtém a sessão atual do Supabase (após callback do OAuth)
 * 
 * @returns Access token do Supabase ou null
 */
export async function getSupabaseSession(): Promise<{ accessToken: string | null; error: Error | null }> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      accessToken: null,
      error: new Error('Supabase não configurado.'),
    };
  }

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return {
      accessToken: null,
      error: new Error(error.message),
    };
  }

  return {
    accessToken: session?.access_token || null,
    error: null,
  };
}

/**
 * Limpa a sessão do Supabase (após enviar token para o backend)
 */
export async function clearSupabaseSession(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export default {
  getSupabaseClient,
  signInWithGoogle,
  getSupabaseSession,
  clearSupabaseSession,
};
