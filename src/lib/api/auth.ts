// Auth API - Authentication and registration endpoints
import { getOrCreateDeviceId } from '../device'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

export interface RegisterRequest {
  email: string
  password: string
  cnpj: string
  empresa: string
  empresa_id?: string
}

export interface RegisterResponse {
  success: boolean
  user?: {
    id: string
    email: string
    empresa: string
    role: string
  }
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    email: string
    nome?: string
    role: string
    empresa_id: string
  }
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const deviceId = getOrCreateDeviceId()

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Falha no registro')
  }

  return result
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const deviceId = getOrCreateDeviceId()

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify(data)
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Falha no login')
  }

  return result
}