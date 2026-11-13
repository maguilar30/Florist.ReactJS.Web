import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <>
      <section className="hero" id="inicio">
        <div className="container hero-grid">
          <div>
            <p className="hero-badge">Flores frescas · Entrega local</p>
            <h1>
              Donde cada pétalo cuenta <em>una historia</em>
            </h1>
            <p className="hero-lead">
              En Floristería Yada diseñamos arreglos únicos para bodas, cumpleaños y esos gestos que no
              necesitan palabras.
            </p>
            <div className="hero-actions">
              <Link to="/productos" className="btn btn-primary">
                Ver colección
              </Link>
              <Link to="/contacto" className="btn btn-outline">
                Agendar consulta
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div
              className="hero-card"
              role="img"
              aria-label="Ramo de rosas y flores de temporada"
            >
              <p className="hero-card-caption">Temporada de primavera</p>
            </div>
            <div className="hero-float">
              <strong>10+</strong>
              <span>Años creando momentos inolvidables</span>
            </div>
          </div>
        </div>
      </section>

      <section className="about" id="nosotros">
        <div className="container about-grid">
          <div className="about-image" role="img" aria-label="Florista preparando un arreglo" />
          <div className="about-text">
            <h2>Tradición y diseño en cada arreglo</h2>
            <p>
              Somos un taller floral de barrio con raíces familiares. Seleccionamos flores de productores
              locales cada mañana para que tu regalo llegue con vida y aroma auténtico.
            </p>
            <p>
              Ya sea un ramo sencillo o la decoración completa de tu evento, nuestro equipo te acompaña con
              asesoría personalizada y entrega puntual.
            </p>
            <ul className="about-list">
              <li>Flores de temporada y importadas bajo pedido</li>
              <li>Empaque ecológico y tarjetas personalizadas</li>
              <li>Eventos corporativos y celebraciones íntimas</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="services" id="servicios">
        <div className="container">
          <header className="section-header">
            <h2>Cómo te ayudamos</h2>
            <p>Servicios pensados para que solo te preocupes por disfrutar el momento.</p>
          </header>
          <div className="service-grid">
            <div className="service-item">
              <div className="service-icon" aria-hidden="true">
                🚚
              </div>
              <h3>Entrega el mismo día</h3>
              <p>Pedidos antes de las 2 p.m. en zona metropolitana.</p>
            </div>
            <div className="service-item">
              <div className="service-icon" aria-hidden="true">
                💐
              </div>
              <h3>Bodas y eventos</h3>
              <p>Centros de mesa, arcos florales y ramos de novia.</p>
            </div>
            <div className="service-item">
              <div className="service-icon" aria-hidden="true">
                🏢
              </div>
              <h3>Corporativo</h3>
              <p>Suscripciones semanales para oficinas y hoteles.</p>
            </div>
            <div className="service-item">
              <div className="service-icon" aria-hidden="true">
                🎀
              </div>
              <h3>Talleres</h3>
              <p>Aprende composición floral en grupos reducidos.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
