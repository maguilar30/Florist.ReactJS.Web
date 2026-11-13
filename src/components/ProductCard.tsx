import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { Button } from './ui/Button'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const image = product.imageUrl || FALLBACK_IMAGE

  return (
    <article className="product-card">
      <Link to={`/productos/${product.id}`} className="product-card-image-link">
        <div
          className="product-card-image"
          style={{ backgroundImage: `url('${image}')` }}
          role="img"
          aria-label={product.name}
        />
      </Link>
      <div className="product-card-body">
        {product.category && <p className="product-card-category">{product.category}</p>}
        <h3>
          <Link to={`/productos/${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <Button
            variant="primary"
            disabled={!product.inStock}
            onClick={() => addItem(product)}
          >
            {product.inStock ? 'Agregar' : 'Agotado'}
          </Button>
        </div>
      </div>
    </article>
  )
}
