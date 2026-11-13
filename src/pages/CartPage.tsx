import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestOrder } from '../api/orders'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { DiscountCodeField } from '../components/DiscountCodeField'
import { LoyaltyRewardField } from '../components/LoyaltyRewardField'
import { type AppliedDiscount, computeDiscountAmount } from '../discount'
import { loyaltyDiscountAmount, loyaltyWaivesDelivery } from '../loyalty'
import { deliveryFeeFor, requiresAddress } from '../delivery'
import { useDeliveryOptions } from '../hooks/useDeliveryOptions'
import { formatMoney } from '../money'
import { Button } from '../components/ui/Button'
import type { LoyaltyRewardProgress } from '../types'

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { user } = useAuth()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const deliveryOptions = useDeliveryOptions()
  const [deliveryOption, setDeliveryOption] = useState('pickup')
  const [notes, setNotes] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [appliedLoyalty, setAppliedLoyalty] = useState<LoyaltyRewardProgress | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setCustomerName((current) => current || user.fullName)
    setCustomerEmail((current) => current || user.email)
  }, [user])

  useEffect(() => {
    if (!deliveryOptions.some((option) => option.code === deliveryOption)) {
      setDeliveryOption(deliveryOptions[0]?.code ?? 'pickup')
    }
  }, [deliveryOptions, deliveryOption])

  const shippingFee = loyaltyWaivesDelivery(appliedLoyalty)
    ? 0
    : deliveryFeeFor(deliveryOption, deliveryOptions)
  const needsAddress = requiresAddress(deliveryOption, deliveryOptions)
  const discountAmount = appliedDiscount
    ? computeDiscountAmount(subtotal, appliedDiscount.percent, appliedDiscount.maxDiscount)
    : 0
  const loyaltyAmount = appliedLoyalty ? loyaltyDiscountAmount(appliedLoyalty, subtotal) : 0

  async function handleRequestOrder(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await requestOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim() || undefined,
        deliveryOption,
        notes: notes.trim() || undefined,
        discountCode: appliedDiscount?.code,
        loyaltyRewardId: appliedLoyalty?.id,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      })
      clearCart()
      setSuccessMessage(
        result.message ||
          'Recibimos tu solicitud. Pronto te contactaremos para coordinar el pago.',
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (successMessage) {
    return (
      <section className="page-section">
        <div className="container narrow empty-state-wrap">
          <h2>Pedido solicitado</h2>
          <p className="banner banner-success" role="status">
            {successMessage}
          </p>
          <p>Nuestro equipo te escribirá o llamará para indicarte cómo realizar el pago.</p>
          <div className="hero-actions">
            {user && (
              <Link to="/mis-pedidos" className="btn btn-outline">
                Ver mis pedidos
              </Link>
            )}
            <Link to="/productos" className="btn btn-primary">
              Volver a la colección
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="page-section">
        <div className="container narrow empty-state-wrap">
          <h2>Tu carrito está vacío</h2>
          <p>Explora la colección y agrega un arreglo especial.</p>
          <Link to="/productos" className="btn btn-primary">
            Ver productos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Carrito</h2>
          <p>Revisa tu pedido. Al solicitarlo, te contactaremos para coordinar el pago.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="cart-layout">
          <ul className="cart-list">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="cart-item card">
                <div
                  className="cart-item-thumb"
                  style={{
                    backgroundImage: `url('${product.imageUrl ?? 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&q=80'}')`,
                  }}
                  aria-hidden="true"
                />
                <div className="cart-item-body">
                  <Link to={`/productos/${product.id}`}>
                    <strong>{product.name}</strong>
                  </Link>
                  <p className="price">{formatMoney(product.price)} c/u</p>
                  <div className="qty-row">
                    <label htmlFor={`qty-${product.id}`} className="sr-only">
                      Cantidad
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                    />
                    <button type="button" className="link-btn" onClick={() => removeItem(product.id)}>
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="cart-line-total">{formatMoney(product.price * quantity)}</p>
              </li>
            ))}
          </ul>

          <aside className="cart-summary card">
            <h3>Resumen</h3>
            <p className="cart-subtotal">
              Subtotal <strong>{formatMoney(subtotal)}</strong>
            </p>
            {discountAmount > 0 && (
              <p className="cart-subtotal">
                Descuento{appliedDiscount ? ` (${appliedDiscount.code})` : ''}{' '}
                <strong>−{formatMoney(discountAmount)}</strong>
              </p>
            )}
            {(loyaltyAmount > 0 || appliedLoyalty) && (
              <p className="cart-subtotal">
                Fidelidad{appliedLoyalty ? ` (${appliedLoyalty.name})` : ''}{' '}
                <strong>{loyaltyAmount > 0 ? `−${formatMoney(loyaltyAmount)}` : 'canjeada'}</strong>
              </p>
            )}
            <p className="cart-subtotal">
              Envío <strong>{formatMoney(shippingFee)}</strong>
            </p>
            <p className="cart-subtotal cart-total">
              Total <strong>{formatMoney(subtotal - discountAmount - loyaltyAmount + shippingFee)}</strong>
            </p>
            <p className="cart-note">
              No se cobra en línea. Recibirás un mensaje para coordinar el pago.
            </p>
            <form className="auth-form" onSubmit={handleRequestOrder}>
              <fieldset className="delivery-options">
                <legend>Entrega</legend>
                {deliveryOptions.length === 0 ? (
                  <p className="cart-note">No hay opciones de entrega configuradas.</p>
                ) : (
                  deliveryOptions.map((option) => (
                    <label key={option.code} className="checkbox-row" htmlFor={`delivery-${option.code}`}>
                      <input
                        id={`delivery-${option.code}`}
                        type="radio"
                        name="delivery-option"
                        value={option.code}
                        checked={deliveryOption === option.code}
                        onChange={() => setDeliveryOption(option.code)}
                      />
                      <span>
                        {option.label}
                        {option.fee === 0 ? ' — Gratis' : ` — ${formatMoney(option.fee)}`}
                      </span>
                    </label>
                  ))
                )}
              </fieldset>
              <div>
                <label htmlFor="order-name">Nombre</label>
                <input
                  id="order-name"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="order-email">Correo</label>
                <input
                  id="order-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value)
                    setAppliedDiscount(null)
                    setAppliedLoyalty(null)
                  }}
                />
              </div>
              <div>
                <label htmlFor="order-phone">Teléfono</label>
                <input
                  id="order-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="order-address">
                  Dirección de entrega{needsAddress ? '' : ' (opcional)'}
                </label>
                <textarea
                  id="order-address"
                  required={needsAddress}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={
                    needsAddress
                      ? 'Indica dónde entregar el pedido'
                      : 'Opcional si recogerás en tienda'
                  }
                />
              </div>
              <DiscountCodeField
                email={customerEmail}
                subtotal={subtotal}
                applied={appliedDiscount}
                onApplied={(value) => {
                  setAppliedDiscount(value)
                  if (value) setAppliedLoyalty(null)
                }}
              />
              <LoyaltyRewardField
                loggedIn={Boolean(user)}
                subtotal={subtotal}
                applied={appliedLoyalty}
                onApplied={(value) => {
                  setAppliedLoyalty(value)
                  if (value) setAppliedDiscount(null)
                }}
              />
              <div>
                <label htmlFor="order-notes">Notas (opcional)</label>
                <textarea
                  id="order-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Fecha, dirección de entrega, ocasión…"
                />
              </div>
              <Button type="submit" fullWidth disabled={submitting || deliveryOptions.length === 0}>
                {submitting ? 'Enviando solicitud…' : 'Solicitar pedido'}
              </Button>
            </form>
            <Button variant="ghost" fullWidth onClick={clearCart} disabled={submitting}>
              Vaciar carrito
            </Button>
          </aside>
        </div>
      </div>
    </section>
  )
}
