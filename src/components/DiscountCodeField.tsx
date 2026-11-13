import { useState } from 'react'
import { previewDiscountCode } from '../api/discounts'
import { ApiError } from '../api/client'
import { type AppliedDiscount } from '../discount'
import { formatMoney } from '../money'
import { Button } from './ui/Button'

type DiscountCodeFieldProps = {
  email: string
  subtotal: number
  applied: AppliedDiscount | null
  onApplied: (value: AppliedDiscount | null) => void
}

export function DiscountCodeField({ email, subtotal, applied, onApplied }: DiscountCodeFieldProps) {
  const [code, setCode] = useState(applied?.code ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply() {
    setError(null)
    if (!email.trim()) {
      setError('Indica el correo del cliente para aplicar el código.')
      return
    }
    setBusy(true)
    try {
      const preview = await previewDiscountCode(code, subtotal, email.trim())
      onApplied({
        code: preview.code,
        description: preview.description,
        percent: preview.percent,
        maxDiscount: preview.maxDiscount,
        remaining: preview.remaining,
      })
      setCode(preview.code)
    } catch (err) {
      onApplied(null)
      setError(err instanceof ApiError ? err.message : 'No se pudo aplicar el código')
    } finally {
      setBusy(false)
    }
  }

  function clear() {
    onApplied(null)
    setCode('')
    setError(null)
  }

  return (
    <div className="discount-field">
      <label htmlFor="discount-code">Código de descuento</label>
      <div className="discount-row">
        <input
          id="discount-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (applied) onApplied(null)
          }}
          placeholder="CUPON10"
          autoComplete="off"
        />
        {applied ? (
          <Button type="button" variant="outline" onClick={clear}>
            Quitar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => void apply()} disabled={busy || !code.trim()}>
            {busy ? 'Aplicando…' : 'Aplicar'}
          </Button>
        )}
      </div>
      {error && (
        <p className="cart-note" role="alert">
          {error}
        </p>
      )}
      {applied && (
        <p className="cart-note">
          {applied.code}
          {applied.description ? ` — ${applied.description}` : ''} ({applied.percent}%
          , máx. {formatMoney(applied.maxDiscount)}, {applied.remaining} usos restantes)
        </p>
      )}
    </div>
  )
}