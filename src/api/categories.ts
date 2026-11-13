import { apiRequest } from './client'
import type { ProductCategory } from '../types'

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  return apiRequest<ProductCategory[]>('/product-categories', { method: 'GET' }, false)
}

export async function createProductCategory(name: string): Promise<ProductCategory> {
  return apiRequest<ProductCategory>('/product-categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export async function updateProductCategory(id: number, name: string): Promise<ProductCategory> {
  return apiRequest<ProductCategory>(`/product-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  })
}

export async function deleteProductCategory(id: number): Promise<void> {
  await apiRequest<void>(`/product-categories/${id}`, { method: 'DELETE' })
}
