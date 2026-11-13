import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { HeaderIcon } from './HeaderIcons'

export function Header() {
  const [navOpen, setNavOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const location = useLocation()
  const adminActive = location.pathname.startsWith('/admin')

  const closeNav = () => setNavOpen(false)

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-brand">
          <Link to="/" className="logo-link" onClick={closeNav}>
            <img
              src="https://yadacr.com/image/catalog/images/Logo/logo_sin_fondo.png"
              height={56}
              width={168}
              title="Floristería Yada"
              alt="Floristería Yada"
              className="logo-img"
            />
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={`btn btn-outline header-admin-btn${adminActive ? ' is-active' : ''}`}
              onClick={closeNav}
            >
              <HeaderIcon name="admin" />
              Admin
            </Link>
          )}
        </div>

        <nav className={`nav ${navOpen ? 'is-open' : ''}`} id="main-nav" aria-label="Principal">
          <NavLink to="/" end onClick={closeNav}>
            <HeaderIcon name="home" />
            Inicio
          </NavLink>
          <NavLink to="/productos" onClick={closeNav}>
            <HeaderIcon name="collection" />
            Colección
          </NavLink>
          <NavLink to="/contacto" onClick={closeNav}>
            <HeaderIcon name="contact" />
            Contacto
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/cuenta" onClick={closeNav}>
                <HeaderIcon name="user" />
                Mi cuenta
              </NavLink>
              <NavLink to="/mis-pedidos" onClick={closeNav}>
                <HeaderIcon name="orders" />
                Mis pedidos
              </NavLink>
              <button
                type="button"
                className="nav-link-btn"
                onClick={() => {
                  logout()
                  closeNav()
                }}
              >
                <HeaderIcon name="logout" />
                Salir
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeNav}>
              <HeaderIcon name="login" />
              Entrar
            </NavLink>
          )}
        </nav>

        <div className="header-actions">
          <Link to="/carrito" className="cart-link" aria-label={`Carrito, ${itemCount} artículos`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6h15l-1.5 9h-12z" />
              <circle cx="9" cy="20" r="1.5" />
              <circle cx="18" cy="20" r="1.5" />
              <path d="M6 6L5 3H2" />
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={navOpen}
            aria-controls="main-nav"
            aria-label={navOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setNavOpen((o) => !o)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/productos" className="btn btn-primary header-cta">
            Ver productos
          </Link>
        </div>
      </div>
    </header>
  )
}
