import { apiRequest } from './client'
import type { Client } from '../types'

export async function fetchClients(): Promise<Client[]> {
  return apiRequest<Client[]>('/clients')
}

export async function fetchClientById(id: string): Promise<Client> {
  return apiRequest<Client>(`/clients/${id}`)
}
