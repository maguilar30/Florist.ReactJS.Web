import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { fetchOrderHistory, fetchOrders, updateOrder } from '../api/orders'
import { ApiError } from '../api/client'
import { FilterEmpty, FilterInput, FilterSelect, TableSearch, matchesSearch } from '../components/admin/TableFilters'
import { OrderHistory } from '../components/OrderHistory'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { DELIVERY_OPTIONS, deliveryFeeFor, deliveryLabel, type DeliveryOption } from '../delivery'
import { ORDER_STATUS_OPTIONS, formatOrderDate, orderStatusLabel } from '../orderStatus'
import type { OrderHistoryEvent, OrderStatus, ShopOrder } from '../types'

export function OrdersAdminPage() {
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ShopOrder | null>(null)
  const [saving, setSaving] = useState(false)
  const [totalInput, setTotalInput] = useState('')
  const [history, setHistory] = useState<OrderHistoryEvent[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [idFilter, setIdFilter] = useState('')
  const [customerFilter, setCustomerFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [totalFilter, setTotalFilter] = useState('')

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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const statusLabel = orderStatusLabel(order.status)
      const total = order.total.toFixed(2)
      return (
        matchesSearch(
          search,
          order.id,
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          order.deliveryAddress,
          order.notes,
          statusLabel,
          total,
          formatOrderDate(order.createdAt),
          ...order.items.map((item) => item.name),
        ) &&
        matchesSearch(idFilter, order.id) &&
        matchesSearch(customerFilter, order.customerName, order.customerEmail) &&
        (!statusFilter || order.status === statusFilter) &&
        matchesSearch(totalFilter, total, `$${total}`)
      )
    })
  }, [orders, search, idFilter, customerFilter, statusFilter, totalFilter])

  const hasFilters = Boolean(search || idFilter || customerFilter || statusFilter || totalFilter)

  async function loadHistory(orderId: number) {
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      setHistory(await fetchOrderHistory(orderId))
    } catch (err) {
      setHistory([])
      setHistoryError(err instanceof ApiError ? err.message : 'No se pudo cargar el historial')
    } finally {
      setHistoryLoading(false)
    }
  }

  function startEdit(order: ShopOrder) {
    setSelected(order)
    setTotalInput(String(order.total))
    setError(null)
    void loadHistory(order.id)
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
      await Promise.all([load(), loadHistory(saved.id)])
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
          <p>Gestiona estado, dirección, precio y notas. Un cambio de estado envía un correo al cliente.</p>
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
              <>
                <TableSearch
                  id="orders-search"
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por cliente, correo, estado, total…"
                />
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
                      <tr className="filter-row">
                        <th>
                          <FilterInput value={idFilter} onChange={setIdFilter} placeholder="#" label="Filtrar número" />
                        </th>
                        <th>
                          <FilterInput
                            value={customerFilter}
                            onChange={setCustomerFilter}
                            placeholder="Cliente"
                            label="Filtrar cliente"
                          />
                        </th>
                        <th>
                          <FilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            label="Filtrar estado"
                            options={ORDER_STATUS_OPTIONS}
                          />
                        </th>
                        <th>
                          <FilterInput
                            value={totalFilter}
                            onChange={setTotalFilter}
                            placeholder="Total"
                            label="Filtrar total"
                          />
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <FilterEmpty query={hasFilters} />
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className={selected?.id === order.id ? 'is-selected' : undefined}>
                            <td>{order.id}</td>
                            <td>
                              {order.customerName}
                              <div className="muted-cell">{formatOrderDate(order.createdAt)}</div>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          <form className="card auth-form" onSubmit={handleSubmit}>
            {!selected ? (
              <p className="empty-state">Selecciona un pedido para actualizarlo.</p>
            ) : (
              <>
                <h3>Pedido #{selected.id}</h3>
                <p className="cart-note">Creado {formatOrderDate(selected.createdAt)}</p>
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
                  <p className="cart-note">Si cambia el estado, avisamos al cliente por correo.</p>
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
                <h4 className="order-history-heading">Historial</h4>
                <OrderHistory events={history} loading={historyLoading} error={historyError} />
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
