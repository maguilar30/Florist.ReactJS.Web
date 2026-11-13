import { useEffect, useMemo, useState } from 'react'
import { fetchProducts } from '../api/products'
import { ProductCard } from '../components/ProductCard'
import { Spinner } from '../components/ui/Spinner'
import type { Product } from '../types'
import { ApiError } from '../api/client'

const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ramo Clásico',
    description: 'Rosas y verdes en tonos románticos, ideal para aniversarios.',
    price: 45,
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d425a7aae625?w=600&q=80',
    inStock: true,
    category: 'Ramos',
  },
  {
    id: 2,
    name: 'Jardín Silvestre',
    description: 'Mezcla de campo con texturas naturales y aroma suave.',
    price: 38,
    imageUrl: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d4?w=600&q=80',
    inStock: true,
    category: 'Ramos',
  },
  {
    id: 3,
    name: 'Elegancia Orquídea',
    description: 'Orquídea en maceta decorativa, regalo duradero y sofisticado.',
    price: 62,
    imageUrl: 'https://images.unsplash.com/photo-1582794543130-2821d68895e2?w=600&q=80',
    inStock: true,
    category: 'Plantas',
  },
]

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingDemo, setUsingDemo] = useState(false)
  const [category, setCategory] = useState('')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchProducts()
        if (!cancelled) {
          setProducts(data)
          setUsingDemo(false)
        }
      } catch (err) {
        if (!cancelled) {
          setProducts(DEMO_PRODUCTS)
          setUsingDemo(true)
          const message =
            err instanceof ApiError
              ? err.message
              : 'No pudimos conectar con el servidor. Mostrando catálogo de demostración.'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(
    () =>
      [...new Set(products.map((product) => product.category?.trim()).filter(Boolean) as string[])].sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [products],
  )
  const visibleProducts = useMemo(
    () => (category ? products.filter((product) => (product.category ?? '').trim() === category) : products),
    [products, category],
  )

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Colección destacada</h2>
          <p>Arreglos listos para regalar o recibir en casa.</p>
        </header>

        {loading && (
          <div className="page-loading">
            <Spinner label="Cargando productos…" />
          </div>
        )}

        {!loading && error && (
          <p className="banner banner-warning" role="status">
            {usingDemo
              ? `${error} Conecta la API para ver el inventario en vivo.`
              : error}
          </p>
        )}

        {!loading && products.length === 0 && (
          <p className="empty-state">No hay productos disponibles por el momento.</p>
        )}

        {!loading && products.length > 0 && (
          <>
            {categories.length > 0 && (
              <div className="collection-filters" role="group" aria-label="Filtrar por categoría">
                <button
                  type="button"
                  className={`collection-filter${category === '' ? ' is-active' : ''}`}
                  aria-pressed={category === ''}
                  onClick={() => setCategory('')}
                >
                  Todas
                </button>
                {categories.map((name) => (
                  <button
                    type="button"
                    key={name}
                    className={`collection-filter${category === name ? ' is-active' : ''}`}
                    aria-pressed={category === name}
                    onClick={() => setCategory(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            {visibleProducts.length === 0 ? (
              <p className="empty-state">No hay productos en esta categoría.</p>
            ) : (
              <div className="product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
