import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Button } from '../components/ui/Button'

export function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <section className="page-section">
        <div className="container narrow empty-state-wrap">
          <h2>Tu carrito está vacío</h2>
          <p>Explora la colección y agrega un arreglo especial.</p>
          <Link to="/productos" className="btn btn-primary">
            Ver productos
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Carrito</h2>
          <p>Revisa tu pedido antes de confirmar con nuestro equipo.</p>
        </header>

        <div className="cart-layout">
          <ul className="cart-list">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="cart-item card">
                <div
                  className="cart-item-thumb"
                  style={{
                    backgroundImage: `url('${product.imageUrl ?? 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&q=80'}')`,
                  }}
                  aria-hidden="true"
                />
                <div className="cart-item-body">
                  <Link to={`/productos/${product.id}`}>
                    <strong>{product.name}</strong>
                  </Link>
                  <p className="price">${product.price.toFixed(2)} c/u</p>
                  <div className="qty-row">
                    <label htmlFor={`qty-${product.id}`} className="sr-only">
                      Cantidad
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                    />
                    <button type="button" className="link-btn" onClick={() => removeItem(product.id)}>
                      Quitar
                    </button>
                  </div>
                </div>
                <p className="cart-line-total">${(product.price * quantity).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <aside className="cart-summary card">
            <h3>Resumen</h3>
            <p className="cart-subtotal">
              Subtotal <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p className="cart-note">
              El envío y detalles de entrega se confirman por WhatsApp o correo después de tu pedido.
            </p>
            <Link to="/contacto" className="btn btn-primary btn-block">
              Solicitar pedido
            </Link>
            <Button variant="ghost" fullWidth onClick={clearCart}>
              Vaciar carrito
            </Button>
          </aside>
        </div>
      </div>
    </section>
  )
}
