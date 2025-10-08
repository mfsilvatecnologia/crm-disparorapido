import React, { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { useAuth, SessionLimitExceededError } from '@/shared/contexts/AuthContext';
import { useToast } from '@/shared/hooks/use-toast';
import { ConnectionStatus } from '@/shared/components/common/ConnectionStatus';
import { useConnectivity } from '@/shared/hooks/useConnectivity';
import { ActiveSessionsManager } from '../components/ActiveSessionsManager';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, sessionLimitError, clearSessionLimitError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const connectivity = useConnectivity();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showSessionManager, setShowSessionManager] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<LoginForm | null>(null);

  // Captura o parâmetro de redirect da URL
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/app';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

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

  React.useEffect(() => {
    if (isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated]);
  
  if (shouldRedirect) {
    // Redireciona para a URL especificada no parâmetro redirect ou para /app
    return <Navigate to={redirectUrl} replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoginError(null);
      await login({ email: data.email, password: data.password });
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao LeadCRM!",
      });
    } catch (error: unknown) {
      // Se for erro de limite de sessões, mostra o gerenciador
      if (error instanceof SessionLimitExceededError) {
        setPendingLoginData(data); // Guarda os dados para retry após revogar
        setShowSessionManager(true);
        return;
      }

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
    <div className="min-h-screen flex" style={{position: 'relative'}}>
      {/* Left side - Hero */}
      <div className="hidden lg:flex flex-1 bg-gradient-hero items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">LeadCRM</h1>
            <p className="text-xl text-white/90">Sistema Multi-Empresa de Lead Generation</p>
          </div>
          
          <div className="glass rounded-2xl p-6 text-left">
            <h3 className="font-semibold mb-3">Recursos Principais:</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li>• Gestão completa de leads</li>
              <li>• Pipeline de vendas visual</li>
              <li>• Múltiplas organizações</li>
              <li>• Analytics em tempo real</li>
              <li>• Integração com ferramentas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">LeadCRM</h1>
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
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
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
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Não tem conta?
                    </span>
                  </div>
                </div>

                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    Criar Nova Conta
                  </Button>
                </Link>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Esqueceu sua senha?{' '}
                    <Link to="/reset-password" className="text-primary hover:underline">
                      Recuperar senha
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