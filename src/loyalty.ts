import { computeDiscountAmount } from './discount'
import type { LoyaltyKind, LoyaltyRewardProgress } from './types'

export const LOYALTY_KIND_LABELS: Record<LoyaltyKind, string> = {
  percent: 'Descuento porcentual',
  free_delivery: 'Envío gratis',
  custom: 'Recompensa en tienda',
}

export function loyaltyDiscountAmount(reward: LoyaltyRewardProgress, subtotal: number): number {
  if (reward.kind !== 'percent') return 0
  return computeDiscountAmount(subtotal, reward.percent, reward.maxDiscount)
}

export function loyaltyWaivesDelivery(reward: LoyaltyRewardProgress | null): boolean {
  return reward?.kind === 'free_delivery'
}
