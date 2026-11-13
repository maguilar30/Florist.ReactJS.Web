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

export interface ProductUpsert {
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

export interface Client {
  id: string
  email: string
  fullName: string
  phone?: string
  roles: string[]
  createdAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type OrderStatus =
  | 'payment_pending'
  | 'paid'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: number
  productId?: number | null
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type OrderHistoryEventType = 'created' | 'status_changed' | 'completed' | string

export interface OrderHistoryEvent {
  id: number
  eventType: OrderHistoryEventType
  fromStatus?: string | null
  toStatus?: string | null
  actorName: string
  actorRole: string
  message: string
  createdAt?: string
}

export interface ShopOrder {
  id: number
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress?: string
  notes?: string
  status: OrderStatus | string
  deliveryOption: string
  subtotal: number
  deliveryFee: number
  total: number
  items: OrderItem[]
  createdAt?: string
  updatedAt?: string
}

export interface OrderRequest {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress?: string
  deliveryOption: string
  notes?: string
  items: { productId: number; quantity: number }[]
}

export interface OrderUpdate {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress?: string
  notes?: string
  status: OrderStatus
  deliveryOption: string
  total: number
}

export interface OrderResponse {
  status: string
  message: string
  orderId: number
  order: ShopOrder
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  readAt?: string | null
  createdAt?: string
}

export interface ContactMessageCreate {
  name: string
  email: string
  message: string
}

export interface ContactMessageResponse {
  status: string
  message: string
  contactMessage: ContactMessage
}

export interface ApiProblem {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string[]>
}
