import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { useToast } from '@/shared/hooks/use-toast';
import { useTenant } from '@/shared/contexts/TenantContext';
import { apiClient } from '@/shared/services/client';
import { ConfirmResetPasswordSchema } from '@/shared/services/schemas';
import type { ConfirmResetPasswordRequest } from '@/shared/services/schemas';

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

export default function NewPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [showSuccess, setShowSuccess] = useState(false);

  const token = searchParams.get('token');
  const type = searchParams.get('type');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ConfirmResetPasswordRequest>({
    resolver: zodResolver(ConfirmResetPasswordSchema),
    defaultValues: { token: token || '' },
  });

  const confirmMutation = useMutation({
    mutationFn: (data: ConfirmResetPasswordRequest) => {
      // Se o token é um access_token do Supabase, enviamos diretamente
      return apiClient.confirmResetPassword(data);
    },
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

  // Verifica se tem token e se é do tipo recovery
  useEffect(() => {
    if (!token || type !== 'recovery') {
      toast({
        title: 'Link inválido',
        description: 'Link para redefinição de senha é inválido ou expirado.',
        variant: 'destructive',
      });
      navigate('/reset-password');
    }
  }, [token, type, navigate, toast]);

  const onSubmit = (data: ConfirmResetPasswordRequest) => {
    confirmMutation.mutate(data);
  };

  const password = watch('password');

  if (showSuccess) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: `linear-gradient(to bottom right, ${tenant.theme.gradientFrom}, ${tenant.theme.gradientTo})`,
        }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-4"
              style={{ backgroundColor: tenant.theme.primary }}
            >
              <Lock
                className="h-6 w-6"
                style={{ color: tenant.theme.primaryForeground }}
              />
            </div>
            <h1 className="text-2xl font-bold text-white">{tenant.branding.companyName}</h1>
          </div>

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

          <div className="mt-8 text-center text-sm text-white/80">
            <p>© {new Date().getFullYear()} {tenant.branding.companyName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: `linear-gradient(to bottom right, ${tenant.theme.gradientFrom}, ${tenant.theme.gradientTo})`,
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-full mb-4"
            style={{ backgroundColor: tenant.theme.primary }}
          >
            <Lock
              className="h-6 w-6"
              style={{ color: tenant.theme.primaryForeground }}
            />
          </div>
          <h1 className="text-2xl font-bold text-white">{tenant.branding.companyName}</h1>
        </div>

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

        <div className="mt-8 text-center text-sm text-white/80">
          <p>© {new Date().getFullYear()} {tenant.branding.companyName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}