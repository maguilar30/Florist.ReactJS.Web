import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchDeliveryFees, updateDeliveryFees } from '../api/delivery'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { DeliveryFee } from '../types'

type DraftFee = {
  key: string
  id: number | null
  label: string
  fee: string
  requiresAddress: boolean
}

function toDraft(row: DeliveryFee): DraftFee {
  return {
    key: String(row.id),
    id: row.id,
    label: row.label,
    fee: String(row.fee),
    requiresAddress: row.requiresAddress,
  }
}

function emptyDraft(): DraftFee {
  return {
    key: `new-${crypto.randomUUID()}`,
    id: null,
    label: '',
    fee: '0',
    requiresAddress: true,
  }
}

export function DeliveryFeesAdminPage() {
  const [drafts, setDrafts] = useState<DraftFee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDrafts((await fetchDeliveryFees()).map(toDraft))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar las tarifas de envío')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function updateDraft(key: string, patch: Partial<DraftFee>) {
    setSaved(false)
    setDrafts((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function addDraft() {
    setSaved(false)
    setDrafts((current) => [...current, emptyDraft()])
  }

  function removeDraft(key: string) {
    setSaved(false)
    setDrafts((current) => (current.length <= 1 ? current : current.filter((row) => row.key !== key)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (drafts.length === 0) {
      setError('Debe existir al menos una tarifa de envío.')
      return
    }
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const savedRows = await updateDeliveryFees(
        drafts.map((row) => ({
          id: row.id ?? undefined,
          label: row.label.trim(),
          fee: Number(row.fee),
          requiresAddress: row.requiresAddress,
        })),
      )
      setDrafts(savedRows.map(toDraft))
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron guardar las tarifas')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Envío</h2>
          <p>Agrega, edita o elimina tarifas. El carrito muestra exactamente estas opciones.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="banner banner-success" role="status">
            Tarifas de envío actualizadas.
          </p>
        )}

        <div className="card auth-form delivery-fees-admin">
          {loading ? (
            <Spinner label="Cargando tarifas…" />
          ) : (
            <form onSubmit={handleSubmit}>
              {drafts.map((row) => (
                <div key={row.key} className="delivery-fee-row">
                  <div>
                    <label htmlFor={`fee-label-${row.key}`}>Opción</label>
                    <input
                      id={`fee-label-${row.key}`}
                      value={row.label}
                      onChange={(e) => updateDraft(row.key, { label: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor={`fee-amount-${row.key}`}>Tarifa</label>
                    <input
                      id={`fee-amount-${row.key}`}
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={row.fee}
                      onChange={(e) => updateDraft(row.key, { fee: e.target.value })}
                    />
                  </div>
                  <label className="checkbox-row delivery-fee-address" htmlFor={`fee-address-${row.key}`}>
                    <input
                      id={`fee-address-${row.key}`}
                      type="checkbox"
                      checked={row.requiresAddress}
                      onChange={(e) => updateDraft(row.key, { requiresAddress: e.target.checked })}
                    />
                    Requiere dirección
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeDraft(row.key)}
                    disabled={drafts.length <= 1}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <div className="hero-actions">
                <Button type="button" variant="outline" onClick={addDraft}>
                  Agregar tarifa
                </Button>
                <Button type="submit" disabled={saving || drafts.length === 0}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
