import { useState, type FormEvent } from 'react'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
    e.currentTarget.reset()
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
          {sent && (
            <p className="banner banner-success" role="status">
              Gracias por escribirnos. Te contactaremos pronto.
            </p>
          )}
          <div>
            <label htmlFor="name">Nombre</label>
            <input type="text" id="name" name="name" required autoComplete="name" />
          </div>
          <div>
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="email" required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Fecha del evento, tipo de arreglo…"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  )
}
