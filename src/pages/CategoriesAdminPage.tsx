import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createProductCategory,
  deleteProductCategory,
  fetchProductCategories,
  updateProductCategory,
} from '../api/categories'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { ProductCategory } from '../types'

export function CategoriesAdminPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCategories(await fetchProductCategories())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(category: ProductCategory) {
    setEditingId(category.id)
    setName(category.name)
  }

  function cancelEdit() {
    setEditingId(null)
    setName('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('El nombre de la categoría es obligatorio.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId != null) {
        await updateProductCategory(editingId, trimmed)
      } else {
        await createProductCategory(trimmed)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar esta categoría? Los productos que la usen quedarán sin categoría.')) return
    setError(null)
    try {
      await deleteProductCategory(id)
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
          <h2>Categorías</h2>
          <p>Define las categorías que se pueden asignar a los productos.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid">
          <form className="card auth-form" onSubmit={handleSubmit}>
            <h3>{editingId != null ? 'Editar categoría' : 'Nueva categoría'}</h3>
            <div>
              <label htmlFor="category-name">Nombre</label>
              <input
                id="category-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <Spinner label="Cargando categorías…" />
            ) : categories.length === 0 ? (
              <p className="empty-state">No hay categorías. Crea una para asignarla a los productos.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td className="table-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(category)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className="link-btn danger"
                            onClick={() => void handleDelete(category.id)}
                          >
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
