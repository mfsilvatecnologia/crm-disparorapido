/**
 * AuthCallbackPage
 * 
 * Página de callback para processar o retorno do OAuth.
 * Recebe o token do Supabase, envia para o backend e redireciona o usuário.
 */

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useGoogleLogin } from '../hooks/useGoogleLogin';
import { AuthContext } from '@/shared/contexts/AuthContext';
import { useTenant } from '@/shared/contexts/TenantContext';
import { clearSupabaseSession } from '@/lib/supabase-auth';

type CallbackStatus = 'processing' | 'success' | 'error';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const authContext = useContext(AuthContext);
  const { processCallback } = useGoogleLogin();
  
  // Todos os hooks devem ser chamados no topo, antes de qualquer return condicional
  const [isContextReady, setIsContextReady] = useState(false);
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [message, setMessage] = useState('Processando login...');
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  
  // Aguarda o contexto estar disponível
  useEffect(() => {
    if (authContext) {
      setIsContextReady(true);
    } else {
      // Se o contexto não estiver disponível após um tempo, mostra erro
      const timer = setTimeout(() => {
        console.error('AuthContext não disponível após 2 segundos');
        navigate('/login?error=auth_context_unavailable', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [authContext, navigate]);
  
  // Processa o callback quando o contexto estiver pronto
  useEffect(() => {
    // Só processa se o contexto estiver pronto
    if (!isContextReady || !authContext) {
      return;
    }

    const { loginWithGoogle } = authContext;

    const handleCallback = async () => {
      try {
        setMessage('Verificando autenticação...');
        
        const result = await processCallback();

        if (!result || !result.success) {
          throw new Error(result?.error || 'Falha ao processar autenticação');
        }

        setMessage('Atualizando sessão...');

        // Atualiza o AuthContext com os dados do login
        await loginWithGoogle(result.data);

        // Limpa a sessão do Supabase APÓS os tokens serem armazenados com sucesso
        // Isso garante que não haja interferência com as requisições autenticadas
        await clearSupabaseSession();

        setStatus('success');
        
        // Verifica se é um novo usuário (sem empresa associada)
        if (result.data.is_new_user || !result.data.empresa) {
          setMessage('Login realizado! Redirecionando para completar cadastro...');
          
          // Aguarda um momento para mostrar a mensagem
          setTimeout(() => {
            navigate('/app/empresas/cadastro', { replace: true });
          }, 1500);
        } else {
          setMessage(`Bem-vindo, ${result.data.user.email}!`);
          
          // Usuário existente - redireciona para o dashboard
          setTimeout(() => {
            navigate('/app', { replace: true });
          }, 1500);
        }

      } catch (err) {
        console.error('Erro no callback OAuth:', err);
        setStatus('error');
        setMessage('Erro ao processar login');
        setErrorDetail(err instanceof Error ? err.message : 'Erro desconhecido');

        // Limpa a sessão do Supabase em caso de erro
        try {
          await clearSupabaseSession();
        } catch (clearError) {
          console.warn('Erro ao limpar sessão do Supabase:', clearError);
        }

        // Redireciona para login após delay
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [isContextReady, authContext, processCallback, navigate]);
  
  // Verifica se o contexto está disponível antes de continuar
  if (!isContextReady || !authContext) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${tenant.theme.gradientFrom} 0%, ${tenant.theme.gradientVia || tenant.theme.gradientFrom} 50%, ${tenant.theme.gradientTo} 100%)`
        }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 
            className="h-12 w-12 animate-spin mx-auto mb-4"
            style={{ color: tenant.theme.primary }}
          />
          <p className="text-gray-600">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${tenant.theme.gradientFrom} 0%, ${tenant.theme.gradientVia || tenant.theme.gradientFrom} 50%, ${tenant.theme.gradientTo} 100%)`
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        {/* Logo */}
        <div className="mb-6">
          <div 
            className="h-16 w-16 rounded-xl flex items-center justify-center mx-auto p-3"
            style={{ backgroundColor: tenant.theme.primary }}
          >
            <img
              src={tenant.branding.logoLight || tenant.branding.logo}
              alt={tenant.branding.companyName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Status Icon */}
        <div className="mb-4">
          {status === 'processing' && (
            <Loader2 
              className="h-12 w-12 animate-spin mx-auto"
              style={{ color: tenant.theme.primary }}
            />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          )}
        </div>

        {/* Message */}
        <h2 className={`text-xl font-semibold mb-2 ${
          status === 'error' ? 'text-red-600' : 'text-gray-900'
        }`}>
          {message}
        </h2>

        {/* Error Detail */}
        {errorDetail && (
          <p className="text-sm text-gray-500 mb-4">
            {errorDetail}
          </p>
        )}

        {/* Redirect Notice */}
        {status === 'error' && (
          <p className="text-sm text-gray-400">
            Redirecionando para a página de login...
          </p>
        )}

        {/* Progress Bar for processing */}
        {status === 'processing' && (
          <div className="mt-6">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full animate-pulse"
                style={{ 
                  width: '60%',
                  backgroundColor: tenant.theme.primary 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
