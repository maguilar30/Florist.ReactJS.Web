import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { changePassword } from '../api/auth'
import { fetchMyLoyalty } from '../api/loyalty'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { LOYALTY_KIND_LABELS } from '../loyalty'
import type { LoyaltyMe } from '../types'

export function AccountPage() {
  const { user, logout, isAdmin } = useAuth()
  const [loyalty, setLoyalty] = useState<LoyaltyMe | null>(null)
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetchMyLoyalty()
      .then((data) => {
        if (!cancelled) setLoyalty(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setLoyaltyError(err instanceof ApiError ? err.message : 'No se pudo cargar tu fidelidad')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.')
      return
    }
    if (currentPassword === newPassword) {
      setPasswordError('La nueva contraseña debe ser distinta a la actual.')
      return
    }
    setSavingPassword(true)
    try {
      const result = await changePassword(currentPassword, newPassword)
      setPasswordMessage(result.message || 'Tu contraseña se actualizó.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof ApiError ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!user) return null

  return (
    <section className="page-section">
      <div className="container narrow">
        <header className="section-header">
          <h2>Mi cuenta</h2>
          <p>Datos de tu perfil y programa de fidelidad.</p>
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

          <div className="loyalty-account">
            <h3>Fidelidad</h3>
            {loyaltyError && (
              <p className="form-error" role="alert">
                {loyaltyError}
              </p>
            )}
            {loyalty && (
              <>
                <p className="loyalty-stars" aria-label={`${loyalty.stars} estrella${loyalty.stars === 1 ? '' : 's'}`}>
                  {Array.from({ length: Math.min(loyalty.stars, 12) }, (_, index) => (
                    <span key={index} aria-hidden="true">
                      ★
                    </span>
                  ))}
                  <strong>
                    {loyalty.stars} estrella{loyalty.stars === 1 ? '' : 's'}
                  </strong>
                </p>
                <p className="cart-note">
                  Cada pedido marcado como entregado suma una estrella. Si el estado cambia a otro, se elimina la estrella.
                </p>
                {loyalty.rewards.length === 0 ? (
                  <p className="cart-note">Aún no hay recompensas publicadas.</p>
                ) : (
                  <ul className="loyalty-reward-list">
                    {loyalty.rewards.map((reward) => (
                      <li key={reward.id} className="loyalty-reward-item">
                        <div>
                          <strong>{reward.name}</strong>
                          <div className="muted-cell">
                            {LOYALTY_KIND_LABELS[reward.kind]} · {reward.ordersRequired} pedidos
                          </div>
                          {reward.description ? <div className="muted-cell">{reward.description}</div> : null}
                          <div className="loyalty-progress-track" aria-hidden="true">
                            <span
                              className="loyalty-progress-fill"
                              style={{
                                width: `${Math.min(100, (reward.starsToward / reward.ordersRequired) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="muted-cell">
                            {reward.available
                              ? 'Ya puedes canjearla en tu próximo pedido'
                              : `${reward.starsToward} / ${reward.ordersRequired} · faltan ${reward.remaining}`}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <form className="auth-form account-password-form" onSubmit={handleChangePassword}>
            <h3>Cambiar contraseña</h3>
            {passwordError && (
              <p className="form-error" role="alert">
                {passwordError}
              </p>
            )}
            {passwordMessage && (
              <p className="banner banner-success" role="status">
                {passwordMessage}
              </p>
            )}
            <div>
              <label htmlFor="account-current-password">Contraseña actual</label>
              <input
                id="account-current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="account-new-password">Nueva contraseña</label>
              <input
                id="account-new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="account-confirm-password">Confirmar nueva contraseña</label>
              <input
                id="account-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Guardando…' : 'Actualizar contraseña'}
            </Button>
          </form>

          <div className="hero-actions">
            <Link to="/mis-pedidos" className="btn btn-outline">
              Mis pedidos
            </Link>
            {isAdmin && (
              <Link to="/admin" className="btn btn-outline">
                Administración
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
