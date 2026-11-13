import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createLoyaltyReward,
  deleteLoyaltyReward,
  fetchLoyaltyMembers,
  fetchLoyaltyRewards,
  updateLoyaltyReward,
} from '../api/loyalty'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { LOYALTY_KIND_LABELS } from '../loyalty'
import { formatMoney } from '../money'
import type { LoyaltyKind, LoyaltyMember, LoyaltyReward } from '../types'

const emptyForm = {
  name: '',
  description: '',
  ordersRequired: '10',
  kind: 'custom' as LoyaltyKind,
  percent: '',
  maxDiscount: '',
  active: true,
}

export function LoyaltyAdminPage() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [members, setMembers] = useState<LoyaltyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [rewardRows, memberRows] = await Promise.all([fetchLoyaltyRewards(), fetchLoyaltyMembers()])
      setRewards(rewardRows)
      setMembers(memberRows)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar el programa de fidelidad')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(row: LoyaltyReward) {
    setEditingId(row.id)
    setForm({
      name: row.name,
      description: row.description,
      ordersRequired: String(row.ordersRequired),
      kind: row.kind,
      percent: row.percent ? String(row.percent) : '',
      maxDiscount: row.maxDiscount ? String(row.maxDiscount) : '',
      active: row.active,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ordersRequired = Number(form.ordersRequired)
    const percent = Number(form.percent || 0)
    const maxDiscount = Number(form.maxDiscount || 0)
    if (!form.name.trim()) {
      setError('El nombre de la recompensa es obligatorio.')
      return
    }
    if (!Number.isInteger(ordersRequired) || ordersRequired < 1) {
      setError('Los pedidos requeridos deben ser un número entero mayor que cero.')
      return
    }
    if (form.kind === 'percent' && (!Number.isFinite(percent) || percent <= 0 || percent > 100)) {
      setError('El porcentaje debe estar entre 0 y 100.')
      return
    }
    if (form.kind === 'percent' && (!Number.isFinite(maxDiscount) || maxDiscount <= 0)) {
      setError('El descuento máximo debe ser mayor que cero.')
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      ordersRequired,
      kind: form.kind,
      percent: form.kind === 'percent' ? percent : 0,
      maxDiscount: form.kind === 'percent' ? maxDiscount : 0,
      active: form.active,
    }
    try {
      if (editingId != null) {
        await updateLoyaltyReward(editingId, payload)
      } else {
        await createLoyaltyReward(payload)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la recompensa')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar esta recompensa de fidelidad?')) return
    setError(null)
    try {
      await deleteLoyaltyReward(id)
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
          <h2>Fidelidad</h2>
          <p>
            Cada pedido de un cliente registrado marcado como entregado suma una estrella. Si el estado cambia a
            cualquier otro, se quita. Define cuántos pedidos se necesitan y qué recompensa recibe.
          </p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid">
          <form className="card auth-form" onSubmit={handleSubmit}>
            <h3>{editingId != null ? 'Editar recompensa' : 'Nueva recompensa'}</h3>
            <div>
              <label htmlFor="loyalty-name">Recompensa</label>
              <input
                id="loyalty-name"
                required
                value={form.name}
                onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                placeholder="Ramo de cortesía"
              />
            </div>
            <div>
              <label htmlFor="loyalty-desc">Descripción</label>
              <textarea
                id="loyalty-desc"
                value={form.description}
                onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
                placeholder="Qué recibe el cliente al completar los pedidos"
              />
            </div>
            <div>
              <label htmlFor="loyalty-orders">Pedidos requeridos</label>
              <input
                id="loyalty-orders"
                type="number"
                min="1"
                step="1"
                required
                value={form.ordersRequired}
                onChange={(e) => setForm((current) => ({ ...current, ordersRequired: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="loyalty-kind">Tipo</label>
              <select
                id="loyalty-kind"
                value={form.kind}
                onChange={(e) => setForm((current) => ({ ...current, kind: e.target.value as LoyaltyKind }))}
              >
                <option value="custom">{LOYALTY_KIND_LABELS.custom}</option>
                <option value="percent">{LOYALTY_KIND_LABELS.percent}</option>
                <option value="free_delivery">{LOYALTY_KIND_LABELS.free_delivery}</option>
              </select>
            </div>
            {form.kind === 'percent' ? (
              <>
                <div>
                  <label htmlFor="loyalty-percent">Porcentaje</label>
                  <input
                    id="loyalty-percent"
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
                  <label htmlFor="loyalty-max">Descuento máximo</label>
                  <input
                    id="loyalty-max"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={form.maxDiscount}
                    onChange={(e) => setForm((current) => ({ ...current, maxDiscount: e.target.value }))}
                  />
                </div>
              </>
            ) : null}
            <label className="checkbox-row" htmlFor="loyalty-active">
              <input
                id="loyalty-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((current) => ({ ...current, active: e.target.checked }))}
              />
              <span>Activa</span>
            </label>
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
              <Spinner label="Cargando recompensas…" />
            ) : rewards.length === 0 ? (
              <p className="empty-state">No hay recompensas de fidelidad.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Recompensa</th>
                      <th>Pedidos</th>
                      <th>Tipo</th>
                      <th>Estado</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {rewards.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.name}</strong>
                          {row.description ? <div className="muted-cell">{row.description}</div> : null}
                          {row.kind === 'percent' ? (
                            <div className="muted-cell">
                              {row.percent}% · máx. {formatMoney(row.maxDiscount)}
                            </div>
                          ) : null}
                        </td>
                        <td>{row.ordersRequired}</td>
                        <td>{LOYALTY_KIND_LABELS[row.kind]}</td>
                        <td>{row.active ? 'Activa' : 'Inactiva'}</td>
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

        <div className="card admin-table-wrap admin-stack">
          <h3>Estrellas de clientes</h3>
          {loading ? (
            <Spinner label="Cargando clientes…" />
          ) : members.length === 0 ? (
            <p className="empty-state">Todavía no hay pedidos de cuentas registradas.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Correo</th>
                    <th>Estrellas</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((row) => (
                    <tr key={row.userId}>
                      <td>{row.fullName}</td>
                      <td>{row.email}</td>
                      <td>{row.stars}</td>
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
