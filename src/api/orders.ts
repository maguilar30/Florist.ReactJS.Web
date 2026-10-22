import { apiRequest } from './client'
import type { OrderRequest, OrderResponse, OrderUpdate, ShopOrder } from '../types'

export async function requestOrder(payload: OrderRequest): Promise<OrderResponse> {
  return apiRequest<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchOrders(): Promise<ShopOrder[]> {
  return apiRequest<ShopOrder[]>('/orders')
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
