import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="footer-sitio mt-5">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/imagenes/logo_maestros.png" alt="Logo Ferretería Los Maestros" width="40" height="40" className="logo-nav" />
              <span className="fw-bold">Ferretería Los Maestros</span>
            </div>
            <p className="footer-texto mb-0">
              Materiales de construcción, herramientas y ferretería general con despacho en La Serena y Coquimbo.
              Atendemos a maestros, contratistas y particulares desde 2004.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h2 className="footer-titulo">Mi Cuenta</h2>
            <ul className="list-unstyled footer-lista mb-0">
              <li><Link to="/login">Iniciar sesión</Link></li>
              <li><Link to="/login">Crear cuenta</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h2 className="footer-titulo">Síguenos</h2>
            <p className="footer-texto mb-3">Novedades, ofertas y consejos de obra.</p>
            <div className="d-flex gap-2">
              <a className="icono-red" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <i className="bi bi-facebook" aria-hidden="true"></i>
              </a>
              <a className="icono-red" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h2 className="footer-titulo">Contacto</h2>
            <ul className="list-unstyled footer-lista mb-0">
              <li>Av. Francisco de Aguirre 1450, Local 5<br />La Serena, Región de Coquimbo</li>
              <li><a href="tel:+56932848760">+56 9 3284 8760</a></li>
              <li><a href="mailto:contacto@losmaestros.cl">contacto@losmaestros.cl</a></li>
              <li>Lun a Vie 09:00 - 19:00 · Sáb 10:00 - 14:00</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-barra">
        <div className="container py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <small className="mb-0">&copy; 2026 Ferretería Los Maestros. Todos los derechos reservados.</small>
          <small className="mb-0">Proyecto académico · Duoc UC</small>
        </div>
      </div>
    </footer>
  )
}

export default Footer
