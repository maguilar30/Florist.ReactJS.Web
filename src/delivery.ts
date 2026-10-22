export type DeliveryOption = 'pickup' | 'up_to_2km' | 'up_to_5km' | 'over_5km'

export const DELIVERY_OPTIONS: { value: DeliveryOption; label: string; fee: number }[] = [
  { value: 'pickup', label: 'Recoger en tienda', fee: 0 },
  { value: 'up_to_2km', label: 'Entrega hasta 2 km', fee: 5 },
  { value: 'up_to_5km', label: 'Entrega hasta 5 km', fee: 10 },
  { value: 'over_5km', label: 'Entrega a más de 5 km', fee: 20 },
]

export function deliveryFeeFor(option: string): number {
  return DELIVERY_OPTIONS.find((item) => item.value === option)?.fee ?? 0
}

export function deliveryLabel(option: string): string {
  return DELIVERY_OPTIONS.find((item) => item.value === option)?.label ?? option
}
