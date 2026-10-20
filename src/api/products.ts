import { apiRequest } from './client'
import type { Product } from '../types'

export async function fetchProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products', {}, false)
}

export async function fetchProductById(id: number): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, {}, false)
}
