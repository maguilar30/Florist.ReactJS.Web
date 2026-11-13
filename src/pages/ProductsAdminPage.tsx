import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { fetchProductCategories } from '../api/categories'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../api/products'
import { ApiError } from '../api/client'
import {
  FilterEmpty,
  FilterInput,
  FilterSelect,
  TableSearch,
  matchesSearch,
  uniqueValues,
} from '../components/admin/TableFilters'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { formatMoney } from '../money'
import type { Product, ProductCategory, ProductUpsert } from '../types'

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
  const [categoryOptions, setCategoryOptions] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ProductUpsert>(emptyForm)
  const [priceInput, setPriceInput] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productData, categoryData] = await Promise.all([fetchProducts(), fetchProductCategories()])
      setProducts(productData)
      setCategoryOptions(categoryData)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const categories = useMemo(() => uniqueValues(products.map((product) => product.category)), [products])
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const price = product.price.toFixed(2)
      const stock = product.inStock ? 'Sí' : 'No'
      return (
        matchesSearch(search, product.name, product.description, product.category, price, formatMoney(product.price), stock) &&
        matchesSearch(nameFilter, product.name) &&
        (!categoryFilter || (product.category ?? '') === categoryFilter) &&
        matchesSearch(priceFilter, price, formatMoney(product.price)) &&
        (!stockFilter || (product.inStock ? 'yes' : 'no') === stockFilter)
      )
    })
  }, [products, search, nameFilter, categoryFilter, priceFilter, stockFilter])
  const hasFilters = Boolean(search || nameFilter || categoryFilter || priceFilter || stockFilter)

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
              <select
                id="prod-category"
                value={form.category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                <option value="">Sin categoría</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
                {form.category &&
                  !categoryOptions.some((category) => category.name === form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
              </select>
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
              <>
                <TableSearch
                  id="products-search"
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por nombre, categoría, precio…"
                />
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
                      <tr className="filter-row">
                        <th>
                          <FilterInput value={nameFilter} onChange={setNameFilter} placeholder="Nombre" label="Filtrar nombre" />
                        </th>
                        <th>
                          <FilterSelect
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            label="Filtrar categoría"
                            options={categories.map((category) => ({ value: category, label: category }))}
                          />
                        </th>
                        <th>
                          <FilterInput value={priceFilter} onChange={setPriceFilter} placeholder="Precio" label="Filtrar precio" />
                        </th>
                        <th>
                          <FilterSelect
                            value={stockFilter}
                            onChange={setStockFilter}
                            label="Filtrar stock"
                            options={[
                              { value: 'yes', label: 'Sí' },
                              { value: 'no', label: 'No' },
                            ]}
                          />
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <FilterEmpty query={hasFilters} />
                      ) : (
                        filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.category ?? '—'}</td>
                            <td>{formatMoney(product.price)}</td>
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
