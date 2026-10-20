import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

export function AccountPage() {
  const { user, logout, isAdmin } = useAuth()

  if (!user) return null

  return (
    <section className="page-section">
      <div className="container narrow">
        <header className="section-header">
          <h2>Mi cuenta</h2>
          <p>Datos de tu perfil en Floristería Yada.</p>
        </header>

        <div className="card account-card">
          <dl className="detail-list">
            <div>
              <dt>Nombre</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{user.roles.join(', ') || 'Cliente'}</dd>
            </div>
          </dl>

          <div className="hero-actions">
            {isAdmin && (
              <Link to="/admin/clientes" className="btn btn-outline">
                Gestionar clientes
              </Link>
            )}
            <Button variant="outline" onClick={logout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
