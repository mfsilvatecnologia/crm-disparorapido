// RegisterPage Component - User registration form
import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Zap, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useAuth } from '@/shared/contexts/AuthContext'
import { registerUser, type RegisterRequest } from "../services/auth"

interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  cnpj: string
  empresa: string
}

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    cnpj: '',
    empresa: ''
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
      newErrors.cnpj = 'CNPJ é obrigatório'
    } else {
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '')
      if (cnpjNumbers.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos'
      }
    }

    // Company name validation
    if (!formData.empresa) {
      newErrors.empresa = 'Nome da empresa é obrigatório'
    } else if (formData.empresa.length < 2) {
      newErrors.empresa = 'Nome da empresa deve ter pelo menos 2 caracteres'
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
        empresa: formData.empresa
      }

      const result = await registerUser(registerData)

      if (result.success) {
        setSuccessMessage('Usuário registrado com sucesso! Você pode fazer login agora.')
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          cnpj: '',
          empresa: ''
        })
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

  return (
    <div className="min-h-screen flex">
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
            <h3 className="font-semibold mb-3">Comece agora mesmo:</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li>• Cadastro rápido e gratuito</li>
              <li>• Configure sua empresa</li>
              <li>• Gerencie leads eficientemente</li>
              <li>• Pipeline de vendas visual</li>
              <li>• Analytics em tempo real</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
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
              <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
              <CardDescription>
                Registre sua empresa no LeadCRM
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
                  <Label htmlFor="cnpj">CNPJ</Label>
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
                  <Button variant="outline" className="w-full">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}