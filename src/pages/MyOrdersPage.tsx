import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchMyOrderHistory, fetchMyOrders } from '../api/orders'
import { ApiError } from '../api/client'
import { OrderHistory } from '../components/OrderHistory'
import { Spinner } from '../components/ui/Spinner'
import { deliveryLabel } from '../delivery'
import { formatOrderDate, orderStatusLabel } from '../orderStatus'
import type { OrderHistoryEvent, ShopOrder } from '../types'

export function MyOrdersPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)
  const [openOrderId, setOpenOrderId] = useState<number | null>(null)
  const [histories, setHistories] = useState<Record<number, OrderHistoryEvent[]>>({})
  const [historyLoadingId, setHistoryLoadingId] = useState<number | null>(null)
  const [historyErrors, setHistoryErrors] = useState<Record<number, string>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoadingOrders(true)
      setOrdersError(null)
      try {
        const data = await fetchMyOrders()
        if (!cancelled) setOrders(data)
      } catch (err) {
        if (!cancelled) {
          setOrdersError(err instanceof ApiError ? err.message : 'No se pudieron cargar tus pedidos')
        }
      } finally {
        if (!cancelled) setLoadingOrders(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  async function toggleOrder(orderId: number) {
    const closing = openOrderId === orderId
    setOpenOrderId(closing ? null : orderId)
    if (closing || histories[orderId] || historyLoadingId === orderId) return
    setHistoryLoadingId(orderId)
    setHistoryErrors((current) => {
      const next = { ...current }
      delete next[orderId]
      return next
    })
    try {
      const events = await fetchMyOrderHistory(orderId)
      setHistories((current) => ({ ...current, [orderId]: events }))
    } catch (err) {
      setHistoryErrors((current) => ({
        ...current,
        [orderId]: err instanceof ApiError ? err.message : 'No se pudo cargar el historial',
      }))
    } finally {
      setHistoryLoadingId(null)
    }
  }

  return (
    <section className="page-section">
      <div className="container narrow">
        <header className="section-header">
          <h2>Mis pedidos</h2>
          <p>Estado, entrega y detalle de cada solicitud hecha con tu cuenta.</p>
        </header>

        {ordersError && (
          <p className="banner banner-error" role="alert">
            {ordersError}
          </p>
        )}

        <div className="card account-orders">
          {loadingOrders ? (
            <Spinner label="Cargando pedidos…" />
          ) : orders.length === 0 ? (
            <p className="empty-state">
              Aún no tienes pedidos.{' '}
              <Link to="/productos">Explorar la colección</Link>
            </p>
          ) : (
            <ul className="account-order-list">
              {orders.map((order) => {
                const open = openOrderId === order.id
                return (
                  <li key={order.id} className="account-order">
                    <button
                      type="button"
                      className="account-order-toggle"
                      aria-expanded={open}
                      onClick={() => void toggleOrder(order.id)}
                    >
                      <span className="account-order-title">
                        Pedido #{order.id}
                        <span className="muted-cell">{formatOrderDate(order.createdAt)}</span>
                      </span>
                      <span className={`status-badge status-${order.status}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                      <strong>${order.total.toFixed(2)}</strong>
                    </button>
                    {open && (
                      <div className="account-order-detail">
                        <p>
                          {deliveryLabel(order.deliveryOption)}
                          {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ''}
                        </p>
                        {order.notes && <p className="cart-note">Notas: {order.notes}</p>}
                        <ul className="order-items">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.quantity} × {item.name} — ${item.lineTotal.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                        <p className="cart-note">
                          Subtotal ${Number(order.subtotal ?? 0).toFixed(2)} · Envío $
                          {Number(order.deliveryFee ?? 0).toFixed(2)}
                        </p>
                        <h4 className="order-history-heading">Historial</h4>
                        <OrderHistory
                          events={histories[order.id] ?? []}
                          loading={historyLoadingId === order.id}
                          error={historyErrors[order.id] ?? null}
                        />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
