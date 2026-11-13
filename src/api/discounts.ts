import { apiRequest } from './client'
import type { DiscountCode, DiscountCodeUpsert, DiscountPreview } from '../types'

export async function fetchDiscountCodes(): Promise<DiscountCode[]> {
  return apiRequest<DiscountCode[]>('/discount-codes')
}

export async function createDiscountCode(payload: DiscountCodeUpsert): Promise<DiscountCode> {
  return apiRequest<DiscountCode>('/discount-codes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateDiscountCode(id: number, payload: DiscountCodeUpsert): Promise<DiscountCode> {
  return apiRequest<DiscountCode>(`/discount-codes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteDiscountCode(id: number): Promise<void> {
  await apiRequest<void>(`/discount-codes/${id}`, { method: 'DELETE' })
}

export async function previewDiscountCode(
  code: string,
  subtotal: number,
  email?: string,
): Promise<DiscountPreview> {
  return apiRequest<DiscountPreview>('/discount-codes/preview', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal, email: email || undefined }),
  })
}
