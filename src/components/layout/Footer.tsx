import { useEffect, useState } from 'react'
import { fetchContactInfo } from '../../api/contact'
import type { ContactInfo } from '../../types'

export function Footer() {
  const [info, setInfo] = useState<ContactInfo | null>(null)

  useEffect(() => {
    void fetchContactInfo()
      .then(setInfo)
      .catch(() => {
        setInfo(null)
      })
  }, [])

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span className="logo">
          Floristería <span>Yada</span>
        </span>
        <p>© {new Date().getFullYear()} Floristería Yada. Todos los derechos reservados.</p>
        <div className="footer-social">
          {info?.instagramUrl ? (
            <a href={info.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
              Instagram
            </a>
          ) : null}
          {info?.facebookUrl ? (
            <a href={info.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">
              Facebook
            </a>
          ) : null}
          {info?.whatsappUrl ? (
            <a href={info.whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
