import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchClients } from '../api/clients'
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from '../api/customers'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { Client, Customer, CustomerUpsert } from '../types'

const emptyForm: CustomerUpsert = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CustomerUpsert>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [customerData, clientData] = await Promise.all([fetchCustomers(), fetchClients()])
      setCustomers(customerData)
      setClients(clientData)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(customer: Customer) {
    setEditingId(customer.id)
    setForm({
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone ?? '',
      address: customer.address ?? '',
      notes: customer.notes ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const payload: CustomerUpsert = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone?.trim() || undefined,
      address: form.address?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    }
    try {
      if (editingId != null) {
        await updateCustomer(editingId, payload)
      } else {
        await createCustomer(payload)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el cliente')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este cliente?')) return
    setError(null)
    try {
      await deleteCustomer(id)
      if (editingId === id) cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar')
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Clientes</h2>
          <p>Ficha de clientes CRM y cuentas registradas en la tienda (requiere rol Admin).</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid">
          <form className="card auth-form" onSubmit={handleSubmit}>
            <h3>{editingId != null ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            <div>
              <label htmlFor="cust-name">Nombre</label>
              <input
                id="cust-name"
                required
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="cust-email">Correo</label>
              <input
                id="cust-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="cust-phone">Teléfono</label>
              <input
                id="cust-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="cust-address">Dirección</label>
              <input
                id="cust-address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="cust-notes">Notas</label>
              <textarea
                id="cust-notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="hero-actions">
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : editingId != null ? 'Actualizar' : 'Crear'}
              </Button>
              {editingId != null && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>

          <div className="card admin-table-wrap">
            {loading ? (
              <Spinner label="Cargando clientes…" />
            ) : customers.length === 0 ? (
              <p className="empty-state">No hay clientes registrados.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Teléfono</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td>{c.fullName}</td>
                        <td>{c.email}</td>
                        <td>{c.phone ?? '—'}</td>
                        <td className="table-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(c)}>
                            Editar
                          </button>
                          <button type="button" className="link-btn danger" onClick={() => void handleDelete(c.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card admin-table-wrap admin-stack">
          <h3>Cuentas de cliente</h3>
          {loading ? (
            <Spinner label="Cargando cuentas…" />
          ) : clients.length === 0 ? (
            <p className="empty-state">No hay cuentas de cliente registradas.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>{client.fullName}</td>
                      <td>{client.email}</td>
                      <td>{client.phone ?? '—'}</td>
                      <td>{client.roles.join(', ') || 'Customer'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
