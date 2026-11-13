import { useState, type FormEvent } from 'react'
import { sendContactMessage } from '../api/contact'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      })
      setSuccess(result.message || 'Gracias por escribirnos. Te contactaremos pronto.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="contact page-section" id="contacto">
      <div className="container contact-grid">
        <div className="contact-info">
          <h2>Visítanos o escríbenos</h2>
          <p className="muted">
            Cuéntanos la ocasión, tu paleta de colores y presupuesto. Respondemos en menos de 24 horas.
          </p>
          <ul className="contact-details">
            <li>
              <strong>Dirección</strong>
              Hatillo 3, San José, Costa Rica
            </li>
            <li>
              <strong>Teléfono</strong>
              <a href="tel:+50686521155">+506 8652-1155</a>
            </li>
            <li>
              <strong>Horario</strong>
              Lun–Sáb 10:00 – 18:00 · Dom cerrado
            </li>
            <li>
              <strong>Correo</strong>
              <a href="mailto:info@yadacr.com">info@yadacr.com</a>
            </li>
          </ul>
        </div>

        <form className="contact-form card" onSubmit={handleSubmit}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="banner banner-success" role="status">
              {success}
            </p>
          )}
          <div>
            <label htmlFor="name">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Fecha del evento, tipo de arreglo…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Enviando…' : 'Enviar mensaje'}
          </Button>
        </form>
      </div>
    </section>
  )
}
