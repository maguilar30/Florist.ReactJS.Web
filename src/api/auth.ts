import { apiRequest, setStoredToken } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types'

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(payload) },
    false,
  )
  setStoredToken(data.token)
  return data
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>(
    '/auth/register',
    { method: 'POST', body: JSON.stringify(payload) },
    false,
  )
  setStoredToken(data.token)
  return data
}

export async function fetchCurrentUser(): Promise<User> {
  return apiRequest<User>('/auth/me')
}

export function logoutLocal(): void {
  setStoredToken(null)
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    '/auth/forgot-password',
    { method: 'POST', body: JSON.stringify({ email }) },
    false,
  )
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    '/auth/reset-password',
    { method: 'POST', body: JSON.stringify({ token, password }) },
    false,
  )
}
