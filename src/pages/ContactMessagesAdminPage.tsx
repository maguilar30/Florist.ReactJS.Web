import { useCallback, useEffect, useMemo, useState } from 'react'
import { deleteContactMessage, fetchContactMessages, markContactMessageRead } from '../api/contact'
import { ApiError } from '../api/client'
import { FilterEmpty, FilterInput, FilterSelect, TableSearch, matchesSearch } from '../components/admin/TableFilters'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { formatOrderDate } from '../orderStatus'
import type { ContactMessage } from '../types'

function isUnread(message: ContactMessage): boolean {
  return !message.readAt
}

export function ContactMessagesAdminPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [working, setWorking] = useState(false)
  const [search, setSearch] = useState('')
  const [idFilter, setIdFilter] = useState('')
  const [senderFilter, setSenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchContactMessages()
      setMessages(data)
      setSelected((current) => {
        if (!current) return current
        return data.find((item) => item.id === current.id) ?? current
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const status = isUnread(item) ? 'unread' : 'read'
      const statusLabel = isUnread(item) ? 'Nuevo' : 'Leído'
      return (
        matchesSearch(
          search,
          item.id,
          item.name,
          item.email,
          item.phone,
          item.message,
          statusLabel,
          formatOrderDate(item.createdAt),
        ) &&
        matchesSearch(idFilter, item.id) &&
        matchesSearch(senderFilter, item.name, item.email, item.phone) &&
        (!statusFilter || status === statusFilter)
      )
    })
  }, [messages, search, idFilter, senderFilter, statusFilter])
  const hasFilters = Boolean(search || idFilter || senderFilter || statusFilter)

  async function openMessage(message: ContactMessage) {
    setSelected(message)
    setError(null)
    if (!isUnread(message)) return
    setWorking(true)
    try {
      const saved = await markContactMessageRead(message.id, true)
      setSelected(saved)
      setMessages((current) => current.map((item) => (item.id === saved.id ? saved : item)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo marcar como leído')
    } finally {
      setWorking(false)
    }
  }

  async function handleDelete() {
    if (!selected) return
    setWorking(true)
    setError(null)
    try {
      await deleteContactMessage(selected.id)
      setSelected(null)
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar el mensaje')
    } finally {
      setWorking(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Mensajes</h2>
          <p>Consultas enviadas desde la página de contacto.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid orders-grid">
          <div className="card admin-table-wrap">
            {loading ? (
              <Spinner label="Cargando mensajes…" />
            ) : messages.length === 0 ? (
              <p className="empty-state">No hay mensajes todavía.</p>
            ) : (
              <>
                <TableSearch
                  id="messages-search"
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por remitente, correo, teléfono o mensaje…"
                />
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Remitente</th>
                        <th>Estado</th>
                        <th aria-label="Acciones" />
                      </tr>
                      <tr className="filter-row">
                        <th>
                          <FilterInput value={idFilter} onChange={setIdFilter} placeholder="#" label="Filtrar número" />
                        </th>
                        <th>
                          <FilterInput
                            value={senderFilter}
                            onChange={setSenderFilter}
                            placeholder="Remitente"
                            label="Filtrar remitente"
                          />
                        </th>
                        <th>
                          <FilterSelect
                            value={statusFilter}
                            onChange={setStatusFilter}
                            label="Filtrar estado"
                            options={[
                              { value: 'unread', label: 'Nuevo' },
                              { value: 'read', label: 'Leído' },
                            ]}
                          />
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMessages.length === 0 ? (
                        <FilterEmpty query={hasFilters} />
                      ) : (
                        filteredMessages.map((item) => (
                          <tr key={item.id} className={selected?.id === item.id ? 'is-selected' : undefined}>
                            <td>{item.id}</td>
                            <td>
                              {item.name}
                              <div className="muted-cell">{item.email}</div>
                              {item.phone ? <div className="muted-cell">{item.phone}</div> : null}
                              <div className="muted-cell">{formatOrderDate(item.createdAt)}</div>
                            </td>
                            <td>
                              <span className={`status-badge ${isUnread(item) ? 'status-payment_pending' : 'status-paid'}`}>
                                {isUnread(item) ? 'Nuevo' : 'Leído'}
                              </span>
                            </td>
                            <td className="table-actions">
                              <button type="button" className="link-btn" onClick={() => void openMessage(item)}>
                                Ver
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

          <div className="card auth-form">
            {!selected ? (
              <p className="empty-state">Selecciona un mensaje para leerlo.</p>
            ) : (
              <>
                <h3>Mensaje #{selected.id}</h3>
                <p className="cart-note">Recibido {formatOrderDate(selected.createdAt)}</p>
                <dl className="detail-list">
                  <div>
                    <dt>Nombre</dt>
                    <dd>{selected.name}</dd>
                  </div>
                  <div>
                    <dt>Correo</dt>
                    <dd>
                      <a href={`mailto:${selected.email}`}>{selected.email}</a>
                    </dd>
                  </div>
                  {selected.phone ? (
                    <div>
                      <dt>Teléfono</dt>
                      <dd>
                        <a href={`tel:${selected.phone.replace(/[^\d+]/g, '')}`}>{selected.phone}</a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                <p className="contact-message-body">{selected.message}</p>
                <Button variant="outline" onClick={() => void handleDelete()} disabled={working}>
                  {working ? 'Trabajando…' : 'Eliminar'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
