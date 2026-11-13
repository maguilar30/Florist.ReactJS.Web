import { useEffect, useState } from 'react'
import { fetchAccountLoyalty, fetchMyLoyalty } from '../api/loyalty'
import { ApiError } from '../api/client'
import { LOYALTY_KIND_LABELS, loyaltyDiscountAmount } from '../loyalty'
import { formatMoney } from '../money'
import type { LoyaltyMe, LoyaltyRewardProgress } from '../types'
import { Button } from './ui/Button'

type LoyaltyRewardFieldProps = {
  loggedIn: boolean
  accountUserId?: string
  subtotal: number
  applied: LoyaltyRewardProgress | null
  onApplied: (value: LoyaltyRewardProgress | null) => void
}

export function LoyaltyRewardField({
  loggedIn,
  accountUserId,
  subtotal,
  applied,
  onApplied,
}: LoyaltyRewardFieldProps) {
  const [summary, setSummary] = useState<LoyaltyMe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!loggedIn && !accountUserId) {
      setSummary(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const request = accountUserId ? fetchAccountLoyalty(accountUserId) : fetchMyLoyalty()
    void request
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setSummary(null)
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el programa de fidelidad')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loggedIn, accountUserId])

  if (!loggedIn && !accountUserId) {
    return (
      <div className="loyalty-field">
        <p className="cart-note">Inicia sesión para acumular estrellas y canjear recompensas de fidelidad.</p>
      </div>
    )
  }

  if (loading && !summary) {
    return <p className="cart-note">Cargando fidelidad…</p>
  }

  if (!summary || summary.rewards.length === 0) {
    return (
      <div className="loyalty-field">
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : (
          <p className="cart-note">
            {summary ? `Tienes ${summary.stars} estrella${summary.stars === 1 ? '' : 's'}.` : null} Aún no hay
            recompensas de fidelidad configuradas.
          </p>
        )}
      </div>
    )
  }

  if (applied) {
    const amount = loyaltyDiscountAmount(applied, subtotal)
    return (
      <div className="loyalty-field">
        <p className="discount-applied">
          Fidelidad: {applied.name}
          {amount > 0 ? ` (−${formatMoney(amount)})` : ''}
          {applied.kind === 'free_delivery' ? ' · envío gratis' : ''}
        </p>
        <Button type="button" variant="outline" onClick={() => onApplied(null)}>
          Quitar
        </Button>
      </div>
    )
  }

  return (
    <div className="loyalty-field">
      <p className="loyalty-stars" aria-label={`${summary.stars} estrella${summary.stars === 1 ? '' : 's'}`}>
        {Array.from({ length: Math.min(summary.stars, 12) }, (_, index) => (
          <span key={index} aria-hidden="true">
            ★
          </span>
        ))}
        <strong>
          {summary.stars} estrella{summary.stars === 1 ? '' : 's'}
        </strong>
      </p>
      <p className="cart-note">
        Cada pedido entregado suma una estrella. Si el estado deja de ser entregado, se quita.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ul className="loyalty-reward-list">
        {summary.rewards.map((reward) => {
          const amount = loyaltyDiscountAmount(reward, subtotal)
          return (
            <li key={reward.id} className="loyalty-reward-item">
              <div>
                <strong>{reward.name}</strong>
                <div className="muted-cell">
                  {LOYALTY_KIND_LABELS[reward.kind]} · {reward.ordersRequired} pedidos
                  {amount > 0 ? ` · ${formatMoney(amount)}` : ''}
                </div>
                {reward.description ? <div className="muted-cell">{reward.description}</div> : null}
                <div className="loyalty-progress-track" aria-hidden="true">
                  <span
                    className="loyalty-progress-fill"
                    style={{ width: `${Math.min(100, (reward.starsToward / reward.ordersRequired) * 100)}%` }}
                  />
                </div>
                <div className="muted-cell">
                  {reward.available
                    ? 'Lista para canjear en este pedido'
                    : `Faltan ${reward.remaining} pedido${reward.remaining === 1 ? '' : 's'}`}
                </div>
              </div>
              {reward.available ? (
                <Button type="button" variant="outline" onClick={() => onApplied(reward)}>
                  Canjear
                </Button>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
