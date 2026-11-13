import type { ApiProblem } from '../types'

export function getCompanyId(): string {
  const configured = import.meta.env.VITE_COMPANY_ID as string | undefined
  return (configured?.trim() || 'yada').toLowerCase()
}

function tokenStorageKey(): string {
  return `yada_auth_token_${getCompanyId()}`
}

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (configured?.trim()) {
    return configured.replace(/\/$/, '')
  }
  return '/api'
}

export function getStoredToken(): string | null {
  return localStorage.getItem(tokenStorageKey())
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(tokenStorageKey(), token)
  } else {
    localStorage.removeItem(tokenStorageKey())
  }
}

export class ApiError extends Error {
  status: number
  body?: ApiProblem

  constructor(message: string, status: number, body?: ApiProblem) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

function normalizeKeys<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeKeys(item)) as T
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const camel = key.charAt(0).toLowerCase() + key.slice(1)
      out[camel] = normalizeKeys(val)
    }
    return out as T
  }
  return value as T
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  headers.set('X-Company-Id', getCompanyId())

  if (auth) {
    const token = getStoredToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(url, { ...options, headers })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let parsed: unknown = undefined
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = text
    }
  }

  if (!response.ok) {
    const problem = typeof parsed === 'object' && parsed !== null ? normalizeKeys<ApiProblem>(parsed) : undefined
    const message =
      problem?.title ??
      problem?.detail ??
      (typeof parsed === 'string' ? parsed : `Request failed (${response.status})`)
    throw new ApiError(message, response.status, problem)
  }

  return normalizeKeys<T>(parsed)
}
