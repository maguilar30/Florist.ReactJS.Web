import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { fetchContactInfo, updateContactInfo } from '../api/contact'
import { ApiError } from '../api/client'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import type { ContactInfo } from '../types'

const emptyForm: ContactInfo = {
  heading: '',
  description: '',
  address: '',
  phone: '',
  hours: '',
  email: '',
  instagramUrl: '',
  facebookUrl: '',
  whatsappUrl: '',
}

export function ContactInfoAdminPage() {
  const [form, setForm] = useState<ContactInfo>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setForm(await fetchContactInfo())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar los datos de contacto')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function setField<K extends keyof ContactInfo>(key: K, value: ContactInfo[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const payload: ContactInfo = {
        heading: form.heading.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        hours: form.hours.trim(),
        email: form.email.trim(),
        instagramUrl: form.instagramUrl.trim(),
        facebookUrl: form.facebookUrl.trim(),
        whatsappUrl: form.whatsappUrl.trim(),
      }
      setForm(await updateContactInfo(payload))
      setSaved(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron guardar los datos de contacto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-section">
      <div className="container">
        <header className="section-header">
          <h2>Datos de contacto</h2>
          <p>Esta información se muestra en la página de contacto y en el pie del sitio.</p>
        </header>

        {error && (
          <p className="banner banner-error" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="banner banner-success" role="status">
            Datos de contacto actualizados.
          </p>
        )}

        <div className="card auth-form contact-info-admin">
          {loading ? (
            <Spinner label="Cargando datos de contacto…" />
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-heading">Título</label>
                <input
                  id="contact-heading"
                  value={form.heading}
                  onChange={(e) => setField('heading', e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-description">Descripción</label>
                <textarea
                  id="contact-description"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="contact-address">Dirección</label>
                <textarea
                  id="contact-address"
                  value={form.address}
                  onChange={(e) => setField('address', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <label htmlFor="contact-phone">Teléfono</label>
                <input
                  id="contact-phone"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-hours">Horario</label>
                <input
                  id="contact-hours"
                  value={form.hours}
                  onChange={(e) => setField('hours', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-email">Correo</label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-instagram">Instagram</label>
                <input
                  id="contact-instagram"
                  value={form.instagramUrl}
                  onChange={(e) => setField('instagramUrl', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-facebook">Facebook</label>
                <input
                  id="contact-facebook"
                  value={form.facebookUrl}
                  onChange={(e) => setField('facebookUrl', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contact-whatsapp">WhatsApp</label>
                <input
                  id="contact-whatsapp"
                  value={form.whatsappUrl}
                  onChange={(e) => setField('whatsappUrl', e.target.value)}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
