import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fetchClients } from '../api/clients'
import { fetchCustomers } from '../api/customers'
import { createAdminOrder } from '../api/orders'
import { fetchProducts } from '../api/products'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { DiscountCodeField } from '../components/DiscountCodeField'
import { LoyaltyRewardField } from '../components/LoyaltyRewardField'
import { type AppliedDiscount, computeDiscountAmount } from '../discount'
import { loyaltyDiscountAmount, loyaltyWaivesDelivery } from '../loyalty'
import { deliveryFeeFor, requiresAddress } from '../delivery'
import { useDeliveryOptions } from '../hooks/useDeliveryOptions'
import { formatMoney } from '../money'
import type { Client, Customer, LoyaltyRewardProgress, Product } from '../types'

type DraftLine = {
  productId: number
  name: string
  price: number
  quantity: number
}

export function CreateOrderAdminPage() {
  const deliveryOptions = useDeliveryOptions()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('')
  const [userId, setUserId] = useState<string | undefined>()
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryOption, setDeliveryOption] = useState('pickup')
  const [notes, setNotes] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null)
  const [appliedLoyalty, setAppliedLoyalty] = useState<LoyaltyRewardProgress | null>(null)
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [lines, setLines] = useState<DraftLine[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const [productData, customerData, clientData] = await Promise.all([
          fetchProducts(),
          fetchCustomers(),
          fetchClients(),
        ])
        if (!cancelled) {
          setProducts(productData)
          setCustomers(customerData)
          setClients(clientData)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Error al cargar datos para el pedido')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!deliveryOptions.some((option) => option.code === deliveryOption)) {
      setDeliveryOption(deliveryOptions[0]?.code ?? 'pickup')
    }
  }, [deliveryOptions, deliveryOption])

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines],
  )
  const shippingFee = loyaltyWaivesDelivery(appliedLoyalty)
    ? 0
    : deliveryFeeFor(deliveryOption, deliveryOptions)
  const needsAddress = requiresAddress(deliveryOption, deliveryOptions)
  const discountAmount = appliedDiscount
    ? computeDiscountAmount(subtotal, appliedDiscount.percent, appliedDiscount.maxDiscount)
    : 0
  const loyaltyAmount = appliedLoyalty ? loyaltyDiscountAmount(appliedLoyalty, subtotal) : 0

  function applySource(value: string) {
    setAppliedDiscount(null)
    setAppliedLoyalty(null)
    setSource(value)
    if (!value) {
      setUserId(undefined)
      return
    }
    if (value.startsWith('customer:')) {
      const customer = customers.find((item) => item.id === Number(value.slice(9)))
      if (!customer) return
      setCustomerName(customer.fullName)
      setCustomerEmail(customer.email)
      setCustomerPhone(customer.phone ?? '')
      setDeliveryAddress(customer.address ?? '')
      const account = clients.find((item) => item.email.toLowerCase() === customer.email.toLowerCase())
      setUserId(account?.id)
      return
    }
    if (value.startsWith('client:')) {
      const client = clients.find((item) => item.id === value.slice(7))
      if (!client) return
      setCustomerName(client.fullName)
      setCustomerEmail(client.email)
      setCustomerPhone(client.phone ?? '')
      setUserId(client.id)
    }
  }

  function addLine() {
    const id = Number(productId)
    const qty = Number(quantity)
    const product = products.find((item) => item.id === id)
    if (!product || !Number.isInteger(qty) || qty < 1) {
      setError('Selecciona un producto y una cantidad válida.')
      return
    }
    setError(null)
    setLines((current) => {
      const existing = current.find((line) => line.productId === product.id)
      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: Math.min(99, line.quantity + qty) } : line,
        )
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, quantity: qty }]
    })
  }

  function removeLine(id: number) {
    setLines((current) => current.filter((line) => line.productId !== id))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (lines.length === 0) {
      setError('Agrega al menos un producto.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const result = await createAdminOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim() || undefined,
        deliveryOption,
        notes: notes.trim() || undefined,
        discountCode: appliedDiscount?.code,
        loyaltyRewardId: appliedLoyalty?.id,
        userId,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      })
      setCreatedId(result.orderId)
      setLines([])
      setNotes('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="page-section">
        <div className="container">
          <Spinner label="Cargando formulario…" />
        </div>
      </section>
    )
  }

  if (createdId != null) {
    return (
      <section className="page-section">
        <div className="container narrow empty-state-wrap">
          <h2>Pedido creado</h2>
          <p className="banner banner-success" role="status">
            Se registró el pedido #{createdId} a nombre del cliente.
          </p>
          <div className="hero-actions">
            <Link to="/admin/pedidos" className="btn btn-primary">
              Ver pedidos
            </Link>
            <Button variant="outline" onClick={() => setCreatedId(null)}>
              Crear otro
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Nuevo pedido</h2>
          <p>Registra un pedido en nombre de un cliente de la tienda o de un contacto nuevo.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <form className="card auth-form admin-order-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="order-source">Cliente existente</label>
            <select id="order-source" value={source} onChange={(e) => applySource(e.target.value)}>
              <option value="">Contacto nuevo / llenar a mano</option>
              {customers.length > 0 && (
                <optgroup label="Clientes CRM">
                  {customers.map((customer) => (
                    <option key={`customer-${customer.id}`} value={`customer:${customer.id}`}>
                      {customer.fullName} — {customer.email}
                    </option>
                  ))}
                </optgroup>
              )}
              {clients.length > 0 && (
                <optgroup label="Cuentas registradas">
                  {clients.map((client) => (
                    <option key={`client-${client.id}`} value={`client:${client.id}`}>
                      {client.fullName} — {client.email}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="admin-order-fields">
            <div>
              <label htmlFor="order-name">Nombre</label>
              <input
                id="order-name"
                required
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
                value={customerEmail}
                onChange={(e) => {
                  const value = e.target.value
                  setCustomerEmail(value)
                  setAppliedDiscount(null)
                  if (userId) {
                    const account = clients.find((item) => item.id === userId)
                    if (account && account.email.toLowerCase() !== value.trim().toLowerCase()) {
                      setUserId(undefined)
                      setAppliedLoyalty(null)
                    }
                  }
                }}
              />
            </div>
            <div>
              <label htmlFor="order-phone">Teléfono</label>
              <input
                id="order-phone"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          <fieldset className="delivery-options">
            <legend>Entrega</legend>
            {deliveryOptions.length === 0 ? (
              <p className="cart-note">No hay opciones de entrega configuradas.</p>
            ) : (
              deliveryOptions.map((option) => (
                <label key={option.code} className="checkbox-row" htmlFor={`admin-delivery-${option.code}`}>
                  <input
                    id={`admin-delivery-${option.code}`}
                    type="radio"
                    name="admin-delivery-option"
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
            <label htmlFor="order-address">Dirección de entrega</label>
            <input
              id="order-address"
              required={needsAddress}
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={needsAddress ? 'Indica dónde entregar el pedido' : 'Opcional'}
            />
          </div>

          <div>
            <label htmlFor="order-notes">Notas (opcional)</label>
            <textarea id="order-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
          {userId ? (
            <LoyaltyRewardField
              loggedIn
              accountUserId={userId}
              subtotal={subtotal}
              applied={appliedLoyalty}
              onApplied={(value) => {
                setAppliedLoyalty(value)
                if (value) setAppliedDiscount(null)
              }}
            />
          ) : (
            <p className="cart-note">Elige una cuenta registrada para canjear estrellas de fidelidad.</p>
          )}

          <div className="admin-order-add">
            <div>
              <label htmlFor="order-product">Producto</label>
              <select id="order-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Seleccionar…</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {formatMoney(product.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="order-qty">Cantidad</label>
              <input
                id="order-qty"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={addLine}>
              Agregar
            </Button>
          </div>

          {lines.length === 0 ? (
            <p className="empty-state">Aún no hay productos en este pedido.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.productId}>
                      <td>{line.name}</td>
                      <td>{line.quantity}</td>
                      <td>{formatMoney(line.price * line.quantity)}</td>
                      <td className="table-actions">
                        <button type="button" className="link-btn danger" onClick={() => removeLine(line.productId)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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

          <Button type="submit" disabled={submitting || lines.length === 0 || deliveryOptions.length === 0}>
            {submitting ? 'Guardando…' : 'Crear pedido'}
          </Button>
        </form>
      </div>
    </section>
  )
}
