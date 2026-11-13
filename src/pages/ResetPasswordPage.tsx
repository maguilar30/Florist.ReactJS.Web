import { useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/auth'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token')?.trim() ?? '', [params])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!token) {
      setError('El enlace no es válido. Solicita uno nuevo.')
      return
    }
    setSubmitting(true)
    try {
      const result = await resetPassword(token, password)
      setMessage(result.message || 'Tu contraseña se actualizó. Ya puedes iniciar sesión.')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la contraseña')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-page">
      <div className="container narrow">
        <header className="section-header">
          <h2>Nueva contraseña</h2>
          <p>Elige una contraseña de al menos 8 caracteres.</p>
        </header>

        <form className="auth-form card" onSubmit={handleSubmit}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="banner banner-success" role="status">
              {message}{' '}
              <Link to="/login">Entrar</Link>
            </p>
          )}
          {!token && !message && (
            <p className="banner banner-error" role="alert">
              Falta el token del enlace. Solicita uno nuevo desde{' '}
              <Link to="/olvide-contrasena">olvidé mi contraseña</Link>.
            </p>
          )}
          <div>
            <label htmlFor="reset-password">Nueva contraseña</label>
            <input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={!token || !!message}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm">Confirmar contraseña</label>
            <input
              id="reset-confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={!token || !!message}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth disabled={submitting || !token || !!message}>
            {submitting ? 'Guardando…' : 'Guardar contraseña'}
          </Button>
          <p className="auth-switch">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
