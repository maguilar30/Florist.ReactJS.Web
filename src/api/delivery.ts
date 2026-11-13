import { apiRequest } from './client'
import type { DeliveryFee } from '../types'

export interface DeliveryFeeUpsert {
  id?: number | null
  label: string
  fee: number
  requiresAddress: boolean
}

export async function fetchDeliveryFees(): Promise<DeliveryFee[]> {
  return apiRequest<DeliveryFee[]>('/delivery-fees', { method: 'GET' }, false)
}

export async function updateDeliveryFees(options: DeliveryFeeUpsert[]): Promise<DeliveryFee[]> {
  return apiRequest<DeliveryFee[]>('/delivery-fees', {
    method: 'PUT',
    body: JSON.stringify({ options }),
  })
}
