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
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-full max-w-[300px] mx-auto mb-6">
            <img
              src={tenant.branding.logo}
              alt={brandName}
              className="w-full h-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>

        <Card className="bg-gradient-card border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
              <CardDescription>
                Cadastre-se na {brandName}
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
                  <Button
                    variant="outline"
                    className="w-full border-border text-[#22c55e] hover:bg-[#22c55e] hover:text-white"
                  >
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
  )
}