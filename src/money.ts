const moneyFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '₡0.00'
  return `₡${moneyFormat.format(amount)}`
}
