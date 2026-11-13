export type AppliedDiscount = {
  code: string
  description: string
  percent: number
  maxDiscount: number
  remaining: number
}

export function computeDiscountAmount(subtotal: number, percent: number, maxDiscount: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0
  const raw = Math.round((subtotal * percent) / 100 * 100) / 100
  return Math.min(raw, maxDiscount, subtotal)
}
