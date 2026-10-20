export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span className="logo">
          Floristería <span>Yada</span>
        </span>
        <p>© {new Date().getFullYear()} Floristería Yada. Todos los derechos reservados.</p>
        <div className="footer-social">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
            Instagram
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            Facebook
          </a>
          <a href="https://wa.me/50686521155" target="_blank" rel="noreferrer" aria-label="WhatsApp">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
