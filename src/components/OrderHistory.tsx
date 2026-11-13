import { actorRoleLabel, formatOrderDate, orderEventLabel } from '../orderStatus'
import { Spinner } from './ui/Spinner'
import type { OrderHistoryEvent } from '../types'

interface OrderHistoryProps {
  events: OrderHistoryEvent[]
  loading?: boolean
  error?: string | null
}

export function OrderHistory({ events, loading = false, error = null }: OrderHistoryProps) {
  if (loading) {
    return <Spinner label="Cargando historial…" />
  }
  if (error) {
    return (
      <p className="form-error" role="alert">
        {error}
      </p>
    )
  }
  if (events.length === 0) {
    return <p className="empty-state">Aún no hay historial para este pedido.</p>
  }

  return (
    <ol className="order-history">
      {events.map((event) => (
        <li key={event.id} className={`order-history-item event-${event.eventType}`}>
          <div className="order-history-meta">
            <span className={`status-badge event-badge event-${event.eventType}`}>
              {orderEventLabel(event.eventType)}
            </span>
            <time className="muted-cell">{formatOrderDate(event.createdAt)}</time>
          </div>
          <p>{event.message}</p>
          <p className="cart-note">
            {event.actorName} · {actorRoleLabel(event.actorRole)}
          </p>
        </li>
      ))}
    </ol>
  )
}
