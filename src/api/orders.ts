import { apiRequest } from './client'
import type { AdminOrderRequest, OrderHistoryEvent, OrderRequest, OrderResponse, OrderUpdate, ShopOrder } from '../types'

export async function requestOrder(payload: OrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createAdminOrder(payload: AdminOrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders/admin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchOrders(): Promise<ShopOrder[]> {
  return apiRequest<ShopOrder[]>('/orders')
}

export async function fetchMyOrders(): Promise<ShopOrder[]> {
  return apiRequest<ShopOrder[]>('/orders/mine')
}

export async function fetchMyOrderById(id: number): Promise<ShopOrder> {
  return apiRequest<ShopOrder>(`/orders/mine/${id}`)
}

export async function fetchMyOrderHistory(id: number): Promise<OrderHistoryEvent[]> {
  return apiRequest<OrderHistoryEvent[]>(`/orders/mine/${id}/history`)
}

export async function fetchOrderHistory(id: number): Promise<OrderHistoryEvent[]> {
  return apiRequest<OrderHistoryEvent[]>(`/orders/${id}/history`)
}

export async function fetchOrderById(id: number): Promise<ShopOrder> {
  return apiRequest<ShopOrder>(`/orders/${id}`)
}

export async function updateOrder(id: number, payload: OrderUpdate): Promise<ShopOrder> {
  return apiRequest<ShopOrder>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
