import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../api/products'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { Product, ProductUpsert } from '../types'

const emptyForm: ProductUpsert = {
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  category: '',
  inStock: true,
}

export function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductUpsert>(emptyForm)
  const [priceInput, setPriceInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts(await fetchProducts())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl ?? '',
      category: product.category ?? '',
      inStock: product.inStock,
    })
    setPriceInput(String(product.price))
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setPriceInput('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const price = Number(priceInput)
    if (!Number.isFinite(price) || price <= 0) {
      setError('El precio debe ser un número mayor que cero.')
      return
    }
    setSaving(true)
    setError(null)
    const payload: ProductUpsert = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      imageUrl: form.imageUrl?.trim() || undefined,
      category: form.category?.trim() || undefined,
      inStock: form.inStock,
    }
    try {
      if (editingId != null) {
        await updateProduct(editingId, payload)
      } else {
        await createProduct(payload)
      }
      cancelEdit()
      await load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar este producto?')) return
    setError(null)
    try {
      await deleteProduct(id)
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
          <h2>Productos</h2>
          <p>Catálogo de la tienda (requiere rol Admin).</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-grid">
          <form className="card auth-form" onSubmit={handleSubmit}>
            <h3>{editingId != null ? 'Editar producto' : 'Nuevo producto'}</h3>
            <div>
              <label htmlFor="prod-name">Nombre</label>
              <input
                id="prod-name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="prod-desc">Descripción</label>
              <textarea
                id="prod-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="prod-price">Precio</label>
              <input
                id="prod-price"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="prod-category">Categoría</label>
              <input
                id="prod-category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor="prod-image">Imagen (URL)</label>
              <input
                id="prod-image"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
            </div>
            <label className="checkbox-row" htmlFor="prod-stock">
              <input
                id="prod-stock"
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
              />
              En inventario
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
              <Spinner label="Cargando productos…" />
            ) : products.length === 0 ? (
              <p className="empty-state">No hay productos en el catálogo.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.category ?? '—'}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>{product.inStock ? 'Sí' : 'No'}</td>
                        <td className="table-actions">
                          <button type="button" className="link-btn" onClick={() => startEdit(product)}>
                            Editar
                          </button>
                          <button
                            type="button"
                            className="link-btn danger"
                            onClick={() => void handleDelete(product.id)}
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
