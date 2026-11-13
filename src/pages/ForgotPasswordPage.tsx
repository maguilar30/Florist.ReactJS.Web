import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/auth'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      const result = await requestPasswordReset(email.trim())
      setMessage(
        result.message ||
          'Si el correo está registrado, te enviaremos un enlace para restablecer la contraseña.',
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el enlace')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="page-section auth-page">
      <div className="container narrow">
        <header className="section-header">
          <h2>¿Olvidaste tu contraseña?</h2>
          <p>Te enviaremos un enlace a tu correo para elegir una nueva.</p>
        </header>

        <form className="auth-form card" onSubmit={handleSubmit}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="banner banner-success" role="status">
              {message}
            </p>
          )}
          <div>
            <label htmlFor="forgot-email">Correo electrónico</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar enlace'}
          </Button>
          <p className="auth-switch">
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
