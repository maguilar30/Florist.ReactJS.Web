import type { OrderStatus } from './types'

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'payment_pending', label: 'Pago pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'ready_for_pickup', label: 'Listo para recoger' },
  { value: 'out_for_delivery', label: 'En camino' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function orderEventLabel(eventType: string): string {
  if (eventType === 'created') return 'Creación'
  if (eventType === 'status_changed') return 'Cambio de estado'
  if (eventType === 'completed') return 'Completado'
  return eventType
}

export function actorRoleLabel(role: string): string {
  if (role === 'admin') return 'Administración'
  if (role === 'customer') return 'Cliente'
  if (role === 'guest') return 'Invitado'
  return role
}

export function formatOrderDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })
}
