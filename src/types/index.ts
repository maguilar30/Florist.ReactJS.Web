export interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
}

export interface AuthResponse {
  token: string
  expiresAt: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
  inStock: boolean
}

export interface Customer {
  id: number
  fullName: string
  email: string
  phone?: string
  address?: string
  notes?: string
  createdAt?: string
}

export interface CustomerUpsert {
  fullName: string
  email: string
  phone?: string
  address?: string
  notes?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface ApiProblem {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}
