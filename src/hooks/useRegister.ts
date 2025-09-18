// useRegister Hook - Custom hook for user registration
import { useState } from 'react'
import { registerUser, type RegisterRequest } from '../lib/api/auth'

interface UseRegisterResult {
  register: (data: RegisterRequest) => Promise<boolean>
  isLoading: boolean
  error: string | null
  success: boolean
  reset: () => void
}

export function useRegister(): UseRegisterResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const register = async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await registerUser(data)

      if (result.success) {
        setSuccess(true)
        return true
      } else {
        setError(result.message || 'Falha no registro')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro no registro'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setSuccess(false)
    setIsLoading(false)
  }

  return {
    register,
    isLoading,
    error,
    success,
    reset
  }
}