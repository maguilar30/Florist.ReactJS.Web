import { useEffect, useState, type FormEvent } from 'react'
import { fetchContactInfo, sendContactMessage } from '../api/contact'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { ContactInfo } from '../types'

function telHref(phone: string): string | undefined {
  const cleaned = phone.replace(/[^\d+]/g, '')
  return cleaned ? `tel:${cleaned}` : undefined
}

export function ContactPage() {
  const [info, setInfo] = useState<ContactInfo | null>(null)
  const [infoError, setInfoError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        setInfo(await fetchContactInfo())
      } catch (err) {
        setInfoError(err instanceof ApiError ? err.message : 'No se pudieron cargar los datos de contacto')
      }
    })()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const result = await sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      })
      setSuccess(result.message || 'Gracias por escribirnos. Te contactaremos pronto.')
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el mensaje')
    } finally {
      setSubmitting(false)
    }
  }

  const phoneLink = info?.phone ? telHref(info.phone) : undefined

  return (
    <section className="contact page-section" id="contacto">
      <div className="container contact-grid">
        <div className="contact-info">
          {!info && !infoError ? (
            <Spinner label="Cargando contacto…" />
          ) : infoError ? (
            <p className="form-error" role="alert">
              {infoError}
            </p>
          ) : info ? (
            <>
              <h2>{info.heading}</h2>
              {info.description ? <p className="muted">{info.description}</p> : null}
              <ul className="contact-details">
                {info.address ? (
                  <li>
                    <strong>Dirección</strong>
                    {info.address}
                  </li>
                ) : null}
                {info.phone ? (
                  <li>
                    <strong>Teléfono</strong>
                    {phoneLink ? <a href={phoneLink}>{info.phone}</a> : info.phone}
                  </li>
                ) : null}
                {info.hours ? (
                  <li>
                    <strong>Horario</strong>
                    {info.hours}
                  </li>
                ) : null}
                {info.email ? (
                  <li>
                    <strong>Correo</strong>
                    <a href={`mailto:${info.email}`}>{info.email}</a>
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}
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
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              autoComplete="tel"
              placeholder="Para contactarte"
              minLength={6}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
