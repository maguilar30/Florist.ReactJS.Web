import { apiRequest } from './client'
import type { Customer, CustomerUpsert } from '../types'

export async function fetchCustomers(): Promise<Customer[]> {
  return apiRequest<Customer[]>('/customers')
}

export async function fetchCustomerById(id: number): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`)
}

export async function createCustomer(payload: CustomerUpsert): Promise<Customer> {
  return apiRequest<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateCustomer(id: number, payload: CustomerUpsert): Promise<Customer> {
  return apiRequest<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiRequest<void>(`/customers/${id}`, { method: 'DELETE' })
}
