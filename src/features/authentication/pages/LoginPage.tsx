
import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Zap, Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { useAuth, SessionLimitExceededError } from '@/shared/contexts/AuthContext';
import { useTenant } from '@/shared/contexts/TenantContext';
import { useToast } from '@/shared/hooks/use-toast';
import { ConnectionStatus } from '@/shared/components/common/ConnectionStatus';
import { useConnectivity } from '@/shared/hooks/useConnectivity';
import { ActiveSessionsManager } from '../components/ActiveSessionsManager';
import { affiliatesApi } from '@/features/affiliates/api/affiliatesApi';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const POST_LOGIN_REDIRECT_KEY = 'crm_post_login_path';

function readAffiliateOnlyUserFromStorage(): boolean {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return false;
    const u = JSON.parse(raw) as { role?: string; roles?: string[] };
    const role = String(u?.role || '').toUpperCase();
    const roles = Array.isArray(u?.roles)
      ? u.roles.map((r) => String(r).toUpperCase())
      : [];
    if (role === 'AFILIADO') return true;
    if (roles.length === 1 && roles[0] === 'AFILIADO') return true;
    return false;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, sessionLimitError, clearSessionLimitError } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const connectivity = useConnectivity();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<LoginForm | null>(null);

  // Captura os parâmetros da URL
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/app';
  const emailFromUrl = searchParams.get('email') || '';
  const isRegistered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      password: '',
    },
  });

  useEffect(() => {
    if (tenant.id !== 'disparo-rapido') return;
    const seoTitle = 'Painel do Cliente | Disparo Rápido';
    const seoDesc =
      'Acesse o Painel do Cliente da Disparo Rápido para gerenciar sua assinatura, alterar sua senha, acessar tutoriais, materiais de treinamento e suporte da ferramenta.';
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content') ?? '';
    document.title = seoTitle;
    if (meta) meta.setAttribute('content', seoDesc);
    return () => {
      document.title = tenant.branding.companyName;
      if (meta) meta.setAttribute('content', prevDesc);
    };
  }, [tenant]);

  // Exibe toast quando usuário foi registrado com sucesso
  useEffect(() => {
    if (isRegistered && emailFromUrl) {
      toast({
        title: "🎉 Registro realizado com sucesso!",
        description: "📧 Verifique seu email para validar sua conta e faça login. A validação é obrigatória para acessar o sistema.",
        duration: 20000, // 20 segundos para dar tempo de ler
        variant: "success" as any, // Cast para any pois o tipo ainda não foi atualizado
      });
      
      // Define o email no formulário
      setValue('email', emailFromUrl);
    }
  }, [isRegistered, emailFromUrl, toast, setValue]);

  // Verifica redirecionamento do Supabase para reset de senha
  useEffect(() => {
    // Verifica se estamos recebendo um redirecionamento do Supabase para reset de senha
    // Pode vir tanto na query string (?token=...) quanto no hash (#access_token=...)
    let token = null;
    let type = null;

    // Verifica query parameters
    const urlParams = new URLSearchParams(location.search);
    token = urlParams.get('token');
    type = urlParams.get('type');

    // Se não encontrou nos query params, verifica no hash (formato do Supabase)
    if (!token && location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      token = hashParams.get('access_token');
      type = hashParams.get('type');
    }

    if (token && type === 'recovery') {
      // Redireciona para a página de nova senha com o token
      navigate(`/nova-senha?token=${token}&type=${type}`);
    }
  }, [location.search, location.hash, navigate]);

  // Movendo a verificação de autenticação para dentro de um useEffect
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated]);
  
  if (shouldRedirect) {
    if (typeof window !== 'undefined') {
      const postLogin = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
      if (postLogin) {
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        return <Navigate to={postLogin} replace />;
      }
    }
    return <Navigate to={redirectUrl} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError(null);
      await login({ email: data.email, password: data.password });

      // Redirecionar para gestão de assinatura se não houver assinatura ativa (contratação pelo checkout do site)
      const subscriptionRedirect = localStorage.getItem('subscription_redirect');
      if (subscriptionRedirect === 'true') {
        localStorage.removeItem('subscription_redirect');
        toast({
          title: "Assinatura Necessária",
          description: "Você precisa de uma assinatura ativa. Contrate pelo checkout do site.",
          variant: "destructive",
          duration: 5000,
        });
        navigate('/app/subscription');
        return;
      }

      const defaultAppTarget =
        redirectUrl === '/app' || redirectUrl === '/app/' || redirectUrl === '';
      if (defaultAppTarget) {
        try {
          await affiliatesApi.getAffiliateCode();
          if (readAffiliateOnlyUserFromStorage()) {
            sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, '/app/afiliados');
          }
        } catch {
          /* não é afiliado ou falha de rede — segue fluxo normal */
        }
      }

      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo ao ${tenant.branding.companyName}!`,
      });
    } catch (error: unknown) {
      // Se for erro de falta de subscription, redireciona para assinatura (contratação pelo checkout do site)
      if (error instanceof Error && error.message === 'NO_ACTIVE_SUBSCRIPTION') {
        toast({
          title: "Assinatura Necessária",
          description: "Você precisa de uma assinatura ativa. Contrate pelo checkout do site.",
          variant: "destructive",
          duration: 5000,
        });
        navigate('/app/subscription');
        return;
      }
      
      // [BLOQUEIO POR LIMITE DE SESSÕES DESATIVADO NO CRM - apenas extensão tem limite]
      // if (error instanceof SessionLimitExceededError) {
      //   setPendingLoginData(data);
      //   setShowSessionManager(true);
      //   return;
      // }

      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.';
      setLoginError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSessionRevoked = async () => {
    // Após revogar uma sessão, tenta fazer login novamente
    if (pendingLoginData) {
      setShowSessionManager(false);
      clearSessionLimitError();

      // Aguarda um pouco para garantir que a sessão foi revogada
      await new Promise(resolve => setTimeout(resolve, 500));

      // Tenta login novamente
      await onSubmit(pendingLoginData);
      setPendingLoginData(null);
    }
  };

  const handleCloseSessionManager = () => {
    setShowSessionManager(false);
    setPendingLoginData(null);
    clearSessionLimitError();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{position: 'relative'}}>
      {/* Removido hero/branding no login para centralizar tudo */}

      {/* Login Form centralizado e sem logo */}
      <div className="flex items-center justify-center p-8 bg-background w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-full max-w-[300px] mx-auto">
              <img
                src={tenant.branding.logo}
                alt={tenant.branding.companyName}
                className="w-full h-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          </div>

          <Card className="bg-gradient-card border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
              <CardDescription>
                Faça login para acessar sua conta
              </CardDescription>
              
              {/* Show connectivity status when offline */}
              {!connectivity.isOnline && (
                <div className="mt-4">
                  <ConnectionStatus variant="card" showDetails={true} />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* [BLOQUEIO POR LIMITE DE SESSÕES DESATIVADO NO CRM - apenas extensão tem limite]
                {sessionLimitError && (
                  <Alert variant="destructive" className="flex flex-col gap-3">
                    <AlertDescription>
                      Limite de sessões atingido ({sessionLimitError.current_sessions}/{sessionLimitError.max_sessions}). Encerre uma sessão para continuar.
                    </AlertDescription>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setShowSessionManager(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Encerrar uma sessão
                    </Button>
                  </Alert>
                )}
                */}
                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                {/* Show inline connectivity status for minor issues */}
                {connectivity.isOnline && connectivity.responseTime && connectivity.responseTime > 2000 && (
                  <Alert>
                    <AlertDescription className="flex items-center gap-2">
                      <ConnectionStatus variant="inline" size="sm" />
                      <span>Conexão lenta detectada</span>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Sua senha"
                      {...register('password')}
                      className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full hover:opacity-90 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${tenant.theme.primary} 0%, ${tenant.theme.accent} 100%)`,
                    color: tenant.theme.primaryForeground
                  }}
                  disabled={isSubmitting || !connectivity.isOnline}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : !connectivity.isOnline ? (
                    'Sem conexão'
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Esqueceu sua senha?{' '}
                    <Link to="/redefinir-senha" className="text-primary hover:underline">
                      Redefinir senha
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Manager Modal */}
      <ActiveSessionsManager
        open={showSessionManager}
        onClose={handleCloseSessionManager}
        forceSelection={true}
        onSessionRevoked={handleSessionRevoked}
      />
    </div>
  );
}
