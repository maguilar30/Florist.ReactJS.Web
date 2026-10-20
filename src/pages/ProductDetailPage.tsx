import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchProductById } from '../api/products'
import { ApiError } from '../api/client'
import { useCart } from '../context/CartContext'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { Product } from '../types'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'

export function ProductDetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setError('Producto no válido')
      setLoading(false)
      return
    }

    let cancelled = false
    void (async () => {
      setLoading(true)
      try {
        const data = await fetchProductById(productId)
        if (!cancelled) setProduct(data)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'No se pudo cargar el producto')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [productId])

  if (loading) {
    return (
      <div className="page-loading page-section">
        <Spinner label="Cargando producto…" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <section className="page-section">
        <div className="container narrow">
          <p className="banner banner-error">{error ?? 'Producto no encontrado'}</p>
          <Link to="/productos" className="btn btn-outline">
            Volver a la colección
          </Link>
        </div>
      </section>
    )
  }

  const image = product.imageUrl || FALLBACK_IMAGE

  return (
    <section className="page-section">
      <div className="container product-detail">
        <div
          className="product-detail-image"
          style={{ backgroundImage: `url('${image}')` }}
          role="img"
          aria-label={product.name}
        />
        <div className="product-detail-info">
          <p className="hero-badge">{product.category ?? 'Arreglo floral'}</p>
          <h1>{product.name}</h1>
          <p className="product-detail-desc">{product.description}</p>
          <p className="price price-lg">${product.price.toFixed(2)}</p>
          <div className="hero-actions">
            <Button disabled={!product.inStock} onClick={() => addItem(product)}>
              {product.inStock ? 'Agregar al carrito' : 'Agotado'}
            </Button>
            <Link to="/carrito" className="btn btn-outline">
              Ver carrito
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
