import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createDiscountCode,
  deleteDiscountCode,
  fetchDiscountCodes,
  updateDiscountCode,
} from '../api/discounts'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { formatMoney } from '../money'
import type { DiscountCode } from '../types'

const emptyForm = {
  code: '',
  description: '',
  percent: '',
  maxDiscount: '',
  maxRedemptions: '100',
  expiresAt: '',
}

function isExpired(expiresAt: string): boolean {
  return expiresAt < new Date().toISOString().slice(0, 10)
}

export function DiscountsAdminPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCodes(await fetchDiscountCodes())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar los códigos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(row: DiscountCode) {
    setEditingId(row.id)
    setForm({
      code: row.code,
      description: row.description,
      percent: String(row.percent),
      maxDiscount: String(row.maxDiscount),
      maxRedemptions: String(row.maxRedemptions),
      expiresAt: row.expiresAt.slice(0, 10),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const percent = Number(form.percent)
    const maxDiscount = Number(form.maxDiscount)
    const maxRedemptions = Number(form.maxRedemptions)
    if (!form.code.trim() || !form.expiresAt) {
      setError('El código y la fecha de vencimiento son obligatorios.')
      return
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      setError('El porcentaje debe estar entre 0 y 100.')
      return
    }
    if (!Number.isFinite(maxDiscount) || maxDiscount <= 0) {
      setError('El descuento máximo debe ser mayor que cero.')
      return
    }
    if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
      setError('El máximo de usos debe ser un número entero mayor que cero.')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      code: form.code.trim(),
      description: form.description.trim(),
      percent,
      maxDiscount,
      maxRedemptions,
      expiresAt: form.expiresAt,
    }
    try {
      if (editingId != null) {
        await updateDiscountCode(editingId, payload)
      } else {
        await createDiscountCode(payload)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el código')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este código de descuento?')) return
    setError(null)
    try {
      await deleteDiscountCode(id)
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
          <h2>Descuentos</h2>
          <p>
            Códigos con porcentaje, tope de descuento, fecha de vencimiento y un máximo de usos (por ejemplo, los
            primeros 100 clientes). Cada persona solo puede usar un código una vez.
          </p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid">
          <form className="card auth-form" onSubmit={handleSubmit}>
            <h3>{editingId != null ? 'Editar código' : 'Nuevo código'}</h3>
            <div>
              <label htmlFor="discount-code">Código</label>
              <input
                id="discount-code"
                required
                value={form.code}
                onChange={(e) => setForm((current) => ({ ...current, code: e.target.value }))}
                placeholder="FLORES10"
              />
            </div>
            <div>
              <label htmlFor="discount-desc">Descripción</label>
              <textarea
                id="discount-desc"
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="discount-percent">Porcentaje</label>
              <input
                id="discount-percent"
                type="number"
                min="0.01"
                max="100"
                step="0.01"
                required
                value={form.percent}
                onChange={(e) => setForm((current) => ({ ...current, percent: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="discount-max">Descuento máximo</label>
              <input
                id="discount-max"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.maxDiscount}
                onChange={(e) => setForm((current) => ({ ...current, maxDiscount: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="discount-redemptions">Máximo de usos</label>
              <input
                id="discount-redemptions"
                type="number"
                min="1"
                step="1"
                required
                value={form.maxRedemptions}
                onChange={(e) => setForm((current) => ({ ...current, maxRedemptions: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="discount-expires">Vence</label>
              <input
                id="discount-expires"
                type="date"
                required
                value={form.expiresAt}
                onChange={(e) => setForm((current) => ({ ...current, expiresAt: e.target.value }))}
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
              <Spinner label="Cargando códigos…" />
            ) : codes.length === 0 ? (
              <p className="empty-state">No hay códigos de descuento.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>%</th>
                      <th>Máximo ₡</th>
                      <th>Usos</th>
                      <th>Vence</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.code}</strong>
                          {row.description ? <div className="muted-cell">{row.description}</div> : null}
                          {isExpired(row.expiresAt) ? <div className="muted-cell">Vencido</div> : null}
                          {row.redemptionCount >= row.maxRedemptions ? (
                            <div className="muted-cell">Sin usos restantes</div>
                          ) : null}
                        </td>
                        <td>{row.percent}%</td>
                        <td>{formatMoney(row.maxDiscount)}</td>
                        <td>
                          {row.redemptionCount} / {row.maxRedemptions}
                        </td>
                        <td>{row.expiresAt.slice(0, 10)}</td>
                        <td className="table-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(row)}>
                            Editar
                          </button>
                          <button type="button" className="link-btn danger" onClick={() => void handleDelete(row.id)}>
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
      </div>
    </section>
  )
}
