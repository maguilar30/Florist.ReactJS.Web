import { apiRequest } from './client'
import type { Product, ProductUpsert } from '../types'

export async function fetchProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/products', {}, false)
}

export async function fetchProductById(id: number): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, {}, false)
}

export async function createProduct(payload: ProductUpsert): Promise<Product> {
  return apiRequest<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateProduct(id: number, payload: ProductUpsert): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteProduct(id: number): Promise<void> {
  await apiRequest<void>(`/products/${id}`, { method: 'DELETE' })
}
