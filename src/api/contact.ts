import { apiRequest } from './client'
import type { ContactInfo, ContactMessage, ContactMessageCreate, ContactMessageResponse } from '../types'

export async function fetchContactInfo(): Promise<ContactInfo> {
  return apiRequest<ContactInfo>('/contact-info', { method: 'GET' }, false)
}

export async function updateContactInfo(payload: ContactInfo): Promise<ContactInfo> {
  return apiRequest<ContactInfo>('/contact-info', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function sendContactMessage(payload: ContactMessageCreate): Promise<ContactMessageResponse> {
  return apiRequest<ContactMessageResponse>('/contact-messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  return apiRequest<ContactMessage[]>('/contact-messages')
}

export async function markContactMessageRead(id: number, read = true): Promise<ContactMessage> {
  return apiRequest<ContactMessage>(`/contact-messages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  })
}

export async function deleteContactMessage(id: number): Promise<void> {
  await apiRequest<void>(`/contact-messages/${id}`, { method: 'DELETE' })
}
