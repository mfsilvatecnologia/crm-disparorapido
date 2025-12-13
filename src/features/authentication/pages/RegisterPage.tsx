// RegisterPage Component - User registration form
import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Zap, Loader2, ShieldCheck, Lock, Fingerprint, BadgeCheck } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useTenant } from '@/shared/contexts/TenantContext'
import { registerUser, type RegisterRequest } from "../services/auth"

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  cnpj: string
  empresa: string
  telefone: string
}

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const { tenant } = useTenant()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    cnpj: '',
    empresa: '',
    telefone: ''
  })

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [apiError, setApiError] = useState('')

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    // CNPJ validation
    if (!formData.cnpj) {
      newErrors.cnpj = 'CNPJ/CPF é obrigatório'
    } else {
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '')
      if (cnpjNumbers.length !== 14 && cnpjNumbers.length !== 11) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos e CPF deve ter 11 dígitos'
      }
    }

    // Company name validation
    if (!formData.empresa) {
      newErrors.empresa = 'Nome da empresa é obrigatório'
    } else if (formData.empresa.length < 2) {
      newErrors.empresa = 'Nome da empresa deve ter pelo menos 2 caracteres'
    }

    // Phone validation
    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório'
    } else if (!/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      newErrors.telefone = 'Telefone inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setApiError('')
    setSuccessMessage('')

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        cnpj: formData.cnpj.replace(/\D/g, ''), // Remove formatting
        empresa: formData.empresa,
        telefone: formData.telefone.replace(/\D/g, '') // Remove formatting
      }

      const result = await registerUser(registerData)

      if (result.success) {
        // Redireciona para login com email preenchido e toast de validação
        navigate(`/login?email=${encodeURIComponent(formData.email)}&registered=true`)
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Erro no registro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'cnpj') {
      setFormData(prev => ({ ...prev, [name]: formatCNPJ(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const brandLogo = tenant.branding.logoLight || tenant.branding.logo
  const brandName = tenant.branding.companyName
  const brandTagline = tenant.branding.companyTagline || 'Ambiente protegido para o seu time'

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 py-10"
      style={{
        background: `linear-gradient(135deg, ${tenant.theme.gradientFrom} 0%, ${tenant.theme.gradientVia || tenant.theme.gradientFrom} 50%, ${tenant.theme.gradientTo} 100%)`
      }}
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_45%)]" />

      <div className="relative w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div
            className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4 p-2 border border-white/40 shadow-glow"
            style={{ backgroundColor: tenant.theme.primary }}
          >
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const parent = e.currentTarget.parentElement
                  if (parent) {
                    const fallback = document.createElement('div')
                    fallback.innerHTML = '<svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>'
                    parent.appendChild(fallback)
                  }
                }}
              />
            ) : (
              <Zap className="h-7 w-7 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold">{brandName}</h1>
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2 justify-center">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {brandTagline}
          </p>
        </div>

        <Card className="bg-gradient-card border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Conexão protegida
              </div>
              <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
              <CardDescription>
                Registre sua empresa no {brandName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {apiError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="empresa">Nome da Empresa</Label>
                  <Input
                    id="empresa"
                    name="empresa"
                    type="text"
                    required
                    value={formData.empresa}
                    onChange={handleChange}
                    className={errors.empresa ? 'border-destructive' : ''}
                    placeholder="Nome da sua empresa"
                  />
                  {errors.empresa && (
                    <p className="text-sm text-destructive">{errors.empresa}</p>
                  )}
                </div>

                {/* CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ ou CPF (válidos)</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={handleChange}
                    maxLength={18}
                    className={errors.cnpj ? 'border-destructive' : ''}
                    placeholder="00.000.000/0000-00"
                  />
                  {errors.cnpj && (
                    <p className="text-sm text-destructive">{errors.cnpj}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'border-destructive' : ''}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={handleChange}
                    maxLength={15}
                    className={errors.telefone ? 'border-destructive' : ''}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && (
                    <p className="text-sm text-destructive">{errors.telefone}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'border-destructive' : ''}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    placeholder="Confirme sua senha"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span>Canal HTTPS com certificado ativo e criptografia durante o cadastro.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    <span>Confirmação por email para ativar sua conta e evitar uso indevido.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span>Tratamento de dados conforme LGPD e auditoria de acessos.</span>
                  </div>
                </div>
              </form>

              <div className="mt-6 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Já tem uma conta?
                    </span>
                  </div>
                </div>

                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-background/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Lock className="h-4 w-4" />
              <span>TLS 1.3</span>
            </div>
            <p className="text-sm text-muted-foreground">Tráfego criptografado do início ao fim para proteger seus dados.</p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Fingerprint className="h-4 w-4" />
              <span>Confirmação</span>
            </div>
            <p className="text-sm text-muted-foreground">Verificação por email e bloqueio automático de acessos suspeitos.</p>
          </div>
          <div className="rounded-xl border bg-background/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <BadgeCheck className="h-4 w-4" />
              <span>LGPD</span>
            </div>
            <p className="text-sm text-muted-foreground">Processos auditáveis e tratamento de dados conforme LGPD.</p>
          </div>
        </div>
        </div>
      </div>
  )
}
