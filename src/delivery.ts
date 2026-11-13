import type { DeliveryFee } from './types'

export const FALLBACK_DELIVERY_OPTIONS: DeliveryFee[] = [
  { id: 0, code: 'pickup', label: 'Recoger en tienda', fee: 0, requiresAddress: false, sortOrder: 1 },
  { id: 0, code: 'up_to_2km', label: 'Entrega hasta 2 km', fee: 5, requiresAddress: true, sortOrder: 2 },
  { id: 0, code: 'up_to_5km', label: 'Entrega hasta 5 km', fee: 10, requiresAddress: true, sortOrder: 3 },
  { id: 0, code: 'over_5km', label: 'Entrega a más de 5 km', fee: 20, requiresAddress: true, sortOrder: 4 },
]

export function findDeliveryOption(code: string, options: DeliveryFee[] = FALLBACK_DELIVERY_OPTIONS): DeliveryFee | undefined {
  return options.find((item) => item.code === code)
}

export function deliveryFeeFor(option: string, options: DeliveryFee[] = FALLBACK_DELIVERY_OPTIONS): number {
  return findDeliveryOption(option, options)?.fee ?? 0
}

export function deliveryLabel(option: string, options: DeliveryFee[] = FALLBACK_DELIVERY_OPTIONS): string {
  return findDeliveryOption(option, options)?.label ?? option
}

export function requiresAddress(option: string, options: DeliveryFee[] = FALLBACK_DELIVERY_OPTIONS): boolean {
  return findDeliveryOption(option, options)?.requiresAddress ?? option !== 'pickup'
}
