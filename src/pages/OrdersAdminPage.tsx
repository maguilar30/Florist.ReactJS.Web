import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchOrders, updateOrder } from '../api/orders'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { DELIVERY_OPTIONS, deliveryFeeFor, deliveryLabel, type DeliveryOption } from '../delivery'
import type { OrderStatus, ShopOrder } from '../types'

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

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('es-CR', { dateStyle: 'short', timeStyle: 'short' })
}

export function OrdersAdminPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ShopOrder | null>(null)
  const [saving, setSaving] = useState(false)
  const [totalInput, setTotalInput] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOrders()
      setOrders(data)
      setSelected((current) => {
        if (!current) return current
        return data.find((order) => order.id === current.id) ?? current
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(order: ShopOrder) {
    setSelected(order)
    setTotalInput(String(order.total))
    setError(null)
  }

  function updateSelected(patch: Partial<ShopOrder>) {
    setSelected((current) => (current ? { ...current, ...patch } : current))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    const total = Number(totalInput)
    if (!Number.isFinite(total) || total < 0) {
      setError('El total debe ser un número válido.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await updateOrder(selected.id, {
        customerName: selected.customerName.trim(),
        customerEmail: selected.customerEmail.trim(),
        customerPhone: selected.customerPhone.trim(),
        deliveryAddress: selected.deliveryAddress?.trim() || '',
        notes: selected.notes?.trim() || '',
        status: selected.status as OrderStatus,
        deliveryOption: selected.deliveryOption,
        total,
      })
      setSelected(saved)
      setTotalInput(String(saved.total))
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el pedido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Pedidos</h2>
          <p>Gestiona estado, dirección, precio y notas de cada solicitud.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid orders-grid">
          <div className="card admin-table-wrap">
            {loading ? (
              <Spinner label="Cargando pedidos…" />
            ) : orders.length === 0 ? (
              <p className="empty-state">No hay pedidos todavía.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th>Total</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={selected?.id === order.id ? 'is-selected' : undefined}>
                        <td>{order.id}</td>
                        <td>
                          {order.customerName}
                          <div className="muted-cell">{formatDate(order.createdAt)}</div>
                        </td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {orderStatusLabel(order.status)}
                          </span>
                        </td>
                        <td>${order.total.toFixed(2)}</td>
                        <td className="table-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(order)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form className="card auth-form" onSubmit={handleSubmit}>
            {!selected ? (
              <p className="empty-state">Selecciona un pedido para actualizarlo.</p>
            ) : (
              <>
                <h3>Pedido #{selected.id}</h3>
                <p className="cart-note">Creado {formatDate(selected.createdAt)}</p>
                <div>
                  <label htmlFor="order-status">Estado</label>
                  <select
                    id="order-status"
                    value={selected.status}
                    onChange={(e) => updateSelected({ status: e.target.value as OrderStatus })}
                  >
                    {ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="order-customer">Nombre</label>
                  <input
                    id="order-customer"
                    required
                    value={selected.customerName}
                    onChange={(e) => updateSelected({ customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="order-email">Correo</label>
                  <input
                    id="order-email"
                    type="email"
                    required
                    value={selected.customerEmail}
                    onChange={(e) => updateSelected({ customerEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="order-phone">Teléfono</label>
                  <input
                    id="order-phone"
                    required
                    value={selected.customerPhone}
                    onChange={(e) => updateSelected({ customerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="order-delivery">Entrega</label>
                  <select
                    id="order-delivery"
                    value={selected.deliveryOption || 'pickup'}
                    onChange={(e) => {
                      const option = e.target.value as DeliveryOption
                      const fee = deliveryFeeFor(option)
                      updateSelected({ deliveryOption: option, deliveryFee: fee })
                      setTotalInput(((selected.subtotal ?? 0) + fee).toFixed(2))
                    }}
                  >
                    {DELIVERY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} — {option.fee === 0 ? 'Gratis' : `$${option.fee.toFixed(2)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="order-address">Dirección de entrega</label>
                  <textarea
                    id="order-address"
                    required={selected.deliveryOption !== 'pickup'}
                    value={selected.deliveryAddress ?? ''}
                    onChange={(e) => updateSelected({ deliveryAddress: e.target.value })}
                    placeholder="Calle, barrio, referencias…"
                  />
                </div>
                <p className="cart-note">
                  Subtotal ${Number(selected.subtotal ?? 0).toFixed(2)} · Envío $
                  {Number(selected.deliveryFee ?? 0).toFixed(2)} ({deliveryLabel(selected.deliveryOption)})
                </p>
                <div>
                  <label htmlFor="order-total">Total a cobrar</label>
                  <input
                    id="order-total"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={totalInput}
                    onChange={(e) => setTotalInput(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="order-notes">Notas</label>
                  <textarea
                    id="order-notes"
                    value={selected.notes ?? ''}
                    onChange={(e) => updateSelected({ notes: e.target.value })}
                  />
                </div>
                <div>
                  <p className="cart-note">Artículos</p>
                  <ul className="order-items">
                    {selected.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity} × {item.name} — ${item.lineTotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
