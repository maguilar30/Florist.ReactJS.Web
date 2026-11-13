export interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
  companyId?: string
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

export interface ProductCategory {
  id: number
  name: string
  sortOrder: number
}

export interface DiscountCode {
  id: number
  code: string
  description: string
  percent: number
  maxDiscount: number
  maxRedemptions: number
  redemptionCount: number
  expiresAt: string
}

export interface DiscountCodeUpsert {
  code: string
  description: string
  percent: number
  maxDiscount: number
  maxRedemptions: number
  expiresAt: string
}

export interface DiscountPreview {
  code: string
  description: string
  percent: number
  maxDiscount: number
  discountAmount: number
  remaining: number
  expiresAt: string
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
  stars?: number
  createdAt?: string
}

export type LoyaltyKind = 'percent' | 'free_delivery' | 'custom'

export interface LoyaltyReward {
  id: number
  name: string
  description: string
  ordersRequired: number
  kind: LoyaltyKind
  percent: number
  maxDiscount: number
  active: boolean
}

export interface LoyaltyRewardUpsert {
  name: string
  description: string
  ordersRequired: number
  kind: LoyaltyKind
  percent: number
  maxDiscount: number
  active: boolean
}

export interface LoyaltyRewardProgress extends LoyaltyReward {
  starsToward: number
  remaining: number
  redeemedCount: number
  available: boolean
}

export interface LoyaltyMe {
  stars: number
  qualifyingOrders: number
  rewards: LoyaltyRewardProgress[]
}

export interface LoyaltyMember {
  userId: string
  email: string
  fullName: string
  phone?: string | null
  stars: number
  orderCount: number
  totalSpent: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface DeliveryFee {
  id: number
  code: string
  label: string
  fee: number
  requiresAddress: boolean
  sortOrder: number
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
  discountCode?: string | null
  discountAmount?: number
  loyaltyReward?: string | null
  loyaltyDiscountAmount?: number
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
  discountCode?: string
  loyaltyRewardId?: number
  items: { productId: number; quantity: number }[]
}

export interface AdminOrderRequest extends OrderRequest {
  userId?: string
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

export interface ContactInfo {
  heading: string
  description: string
  address: string
  phone: string
  hours: string
  email: string
  instagramUrl: string
  facebookUrl: string
  whatsappUrl: string
}

export interface ContactMessage {
  id: number
  name: string
  email: string
  phone?: string
  message: string
  readAt?: string | null
  createdAt?: string
}

export interface ContactMessageCreate {
  name: string
  email: string
  phone: string
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
