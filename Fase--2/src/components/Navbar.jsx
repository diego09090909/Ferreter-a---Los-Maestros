import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar bg-body-tertiary fixed-top shadow-sm">
      <div className="container-fluid">
        
        {/* Logo / Marca */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img 
            src="/imagenes/logo_maestros.png" 
            alt="Logo Ferretería Los Maestros" 
            width="46" 
            height="46" 
            className="logo-nav" 
          />
          <span>Ferretería Los Maestros</span>
        </Link>

        {/* Acciones Rápidas (Usuario, Carrito, Botón Hamburguesa) */}
        <div className="d-flex align-items-center gap-2">
          
          {/* Info Sesión */}
          <div id="info-sesion" className="small text-muted d-none align-items-center gap-1 me-2">
            <span>Bienvenido</span>
            <strong id="nombre-usuario-sesion"></strong>
            <button id="btn-cerrar-sesion" className="btn btn-sm btn-outline-danger ms-1 py-0 px-2">
              Salir
            </button>
          </div>

          {/* Botón Carrito */}
          <Link 
            className="btn btn-outline-secondary border-0 position-relative p-2" 
            to="/carrito" 
            aria-label="Ver carrito"
          >
            <img src="/imagenes/carrito_fondo.jpg" alt="Carrito de compras" className="icono-carrito" />
            <span 
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" 
              id="contador-carrito"
            >
              0
            </span>
          </Link>

          {/* Botón Menú Lateral Offcanvas */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="offcanvas" 
            data-bs-target="#offcanvasNavbar" 
            aria-controls="offcanvasNavbar" 
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Menú Desplegable Lateral (Offcanvas) */}
        <div 
          className="offcanvas offcanvas-end" 
          tabIndex="-1" 
          id="offcanvasNavbar" 
          aria-labelledby="offcanvasNavbarLabel"
        >
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title d-flex align-items-center gap-2" id="offcanvasNavbarLabel">
              <img src="/imagenes/logo_maestros.png" alt="" width="32" height="32" className="logo-nav" />
              Menú
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
          </div>

          <div className="offcanvas-body d-flex flex-column">

            {/* Buscador */}
            <form className="d-flex gap-2 mb-3" role="search">
              <input className="form-control" type="search" placeholder="Buscar producto" aria-label="Buscar producto" />
              <button className="btn btn-outline-success" type="submit">Buscar</button>
            </form>

            {/* Navegación */}
            <p className="text-uppercase text-secondary small fw-bold mb-1">Navegación</p>
            <ul className="navbar-nav mb-3">
              <li className="nav-item">
                <Link className="nav-link" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/catalogo">Catálogo de Productos</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cobertura">Cobertura y Ubicación</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/carrito">Mi Carrito</Link>
              </li>
            </ul>

            {/* Cuenta */}
            <p className="text-uppercase text-secondary small fw-bold mb-1">Cuenta</p>
            <ul className="navbar-nav mb-3">
              <li className="nav-item dropdown">
                <a 
                  className="nav-link dropdown-toggle active" 
                  href="#" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  Mi Cuenta
                </a>
                <ul className="dropdown-menu">
                  <li><Link className="dropdown-item" to="/login">Iniciar sesión</Link></li>
                  <li><Link className="dropdown-item" to="/login">Crear cuenta</Link></li>
                  <li id="nav-link-admin">
                    <hr className="dropdown-divider" />
                    <Link className="dropdown-item" to="/admin">Panel de control</Link>
                  </li>
                </ul>
              </li>
            </ul>

            {/* Info de contacto */}
            <div className="mt-auto pt-3 border-top">
              <p className="mb-1 small text-secondary">Atención: 09:00 - 19:00 hrs</p>
              <p className="mb-0 small text-secondary">Teléfono: +56 9 3284 8760</p>
            </div>

          </div>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;