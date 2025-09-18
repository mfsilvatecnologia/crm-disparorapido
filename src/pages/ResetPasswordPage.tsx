import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';
import { ResetPasswordSchema, ConfirmResetPasswordSchema } from '@/lib/api/schemas';
import type { ResetPasswordRequest, ConfirmResetPasswordRequest } from '@/lib/api/schemas';

// Componente para solicitar reset de senha
function RequestResetForm() {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const resetMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => apiClient.resetPassword(data),
    onSuccess: (response) => {
      setShowSuccess(true);
      toast({
        title: 'Solicitação enviada',
        description: 'Verifique seu email para continuar o processo de reset.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao solicitar reset',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ResetPasswordRequest) => {
    resetMutation.mutate(data);
  };

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Email enviado!</CardTitle>
          <CardDescription>
            Enviamos as instruções para redefinir sua senha para o email informado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Se você não receber o email em alguns minutos, verifique sua pasta de spam
              ou tente novamente.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-3">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowSuccess(false)}
            >
              Tentar novamente
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>
          Informe seu email e CNPJ da empresa para receber as instruções
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <Label htmlFor="cnpj">CNPJ da Empresa</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register('cnpj')}
              className={errors.cnpj ? 'border-destructive' : ''}
            />
            {errors.cnpj && (
              <p className="text-sm text-destructive">{errors.cnpj.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={resetMutation.isPending}
          >
            {resetMutation.isPending ? 'Enviando...' : 'Enviar instruções'}
          </Button>
        </form>

        <div className="mt-6">
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para confirmar reset com nova senha
function ConfirmResetForm({ token }: { token: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ConfirmResetPasswordRequest>({
    resolver: zodResolver(ConfirmResetPasswordSchema),
    defaultValues: { token },
  });

  const confirmMutation = useMutation({
    mutationFn: (data: ConfirmResetPasswordRequest) => apiClient.confirmResetPassword(data),
    onSuccess: (response) => {
      setShowSuccess(true);
      toast({
        title: 'Senha redefinida',
        description: 'Sua senha foi alterada com sucesso.',
      });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao redefinir senha',
        description: error.message || 'Token inválido ou expirado.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ConfirmResetPasswordRequest) => {
    confirmMutation.mutate(data);
  };

  const password = watch('password');

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Senha redefinida!</CardTitle>
          <CardDescription>
            Sua senha foi alterada com sucesso. Você será redirecionado para o login.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha segura para sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('token')} />

          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua nova senha"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua nova senha"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-destructive' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Indicador de força da senha */}
          {password && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Força da senha:</div>
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < getPasswordStrength(password)
                        ? i < 2
                          ? 'bg-red-400'
                          : i < 3
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {getPasswordStrengthText(password)}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>

        <div className="mt-6">
          <Button asChild variant="ghost" className="w-full">
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Função para calcular força da senha
function getPasswordStrength(password: string): number {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

function getPasswordStrengthText(password: string): string {
  const strength = getPasswordStrength(password);
  switch (strength) {
    case 0:
    case 1:
      return 'Muito fraca';
    case 2:
      return 'Fraca';
    case 3:
      return 'Boa';
    case 4:
      return 'Forte';
    default:
      return '';
  }
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">LeadsRápido</h1>
        </div>

        {/* Formulário baseado na presença do token */}
        {token ? (
          <ConfirmResetForm token={token} />
        ) : (
          <RequestResetForm />
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 LeadsRápido. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}