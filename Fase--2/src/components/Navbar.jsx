import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Offcanvas } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useCarrito } from '../context/CarritoContext'

function Buscador({ inicial, onBuscar }) {
  const [texto, setTexto] = useState(inicial)

  return (
    <form
      className="d-flex gap-2 mb-3"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onBuscar(texto.trim())
      }}
    >
      <input
        className="form-control"
        type="search"
        placeholder="Buscar producto"
        aria-label="Buscar producto"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <button className="btn btn-outline-success" type="submit">
        Buscar
      </button>
    </form>
  )
}

function Navbar() {
  const { usuario, esAdmin, cerrarSesion } = useAuth()
  const { unidades: cantidadTotal } = useCarrito()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const buscarEnUrl = params.get('buscar') ?? ''

  const [menuAbierto, setMenuAbierto] = useState(false)
  const cerrarMenu = () => setMenuAbierto(false)

  const buscar = (texto) => {
    navigate(texto === '' ? '/catalogo' : `/catalogo?buscar=${encodeURIComponent(texto)}`)
    cerrarMenu()
  }

  const salir = () => {
    cerrarSesion()
    cerrarMenu()
    navigate('/')
  }

  const claseLink = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '')


  const manejarClickCuenta = () => {
    cerrarMenu()

    if (usuario) {
      navigate('/mi-cuenta')
    } else {
      navigate('/login')
    }
  }

  return (
    <header>
      <nav className="navbar bg-body-tertiary fixed-top shadow-sm">
        <div className="container-fluid">
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

          <div className="d-flex align-items-center gap-2">
            {usuario ? (
              <div className="small text-muted d-flex align-items-center gap-1 me-1 me-sm-2">
                <span className="d-none d-sm-inline">Bienvenido</span>
                <strong className="nombre-sesion">{usuario.nombre || usuario.email}</strong>
                <button type="button" className="btn btn-sm btn-outline-danger ms-1 py-0 px-2" onClick={salir}>
                  Salir
                </button>
              </div>
            ) : (
              <Link className="btn btn-sm btn-outline-success me-1 me-sm-2" to="/login">
                Iniciar sesión
              </Link>
            )}

            <Link
              className="btn btn-outline-secondary border-0 position-relative p-2"
              to="/carrito"
              aria-label="Ver carrito"
            >
              <img src="/imagenes/carrito_fondo.jpg" alt="Carrito de compras" className="icono-carrito" />
              {cantidadTotal > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cantidadTotal}
                </span>
              )}
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              aria-controls="offcanvasNavbar"
              aria-label="Abrir menú"
              onClick={() => setMenuAbierto(true)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          <Offcanvas
            show={menuAbierto}
            onHide={cerrarMenu}
            placement="end"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <Offcanvas.Header closeButton closeLabel="Cerrar" className="border-bottom">
              <Offcanvas.Title id="offcanvasNavbarLabel" className="d-flex align-items-center gap-2">
                <img src="/imagenes/logo_maestros.png" alt="" width="32" height="32" className="logo-nav" />
                Menú
              </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="d-flex flex-column">
              <Buscador key={buscarEnUrl} inicial={buscarEnUrl} onBuscar={buscar} />

              <p className="text-uppercase text-secondary small fw-bold mb-1">Navegación</p>
              <ul className="navbar-nav mb-3">
                <li className="nav-item">
                  <NavLink className={claseLink} to="/" end onClick={cerrarMenu}>Inicio</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={claseLink} to="/catalogo" onClick={cerrarMenu}>Catálogo de Productos</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={claseLink} to="/cobertura" onClick={cerrarMenu}>Cobertura y Ubicación</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={claseLink} to="/carrito" onClick={cerrarMenu}>Mi Carrito</NavLink>
                </li>
              </ul>

              <p className="text-uppercase text-secondary small fw-bold mb-1">Cuenta</p>
              <ul className="navbar-nav mb-3">
                
                <li className="nav-item">
                  <button
                    type="button"
                    className={'nav-link btn text-start w-100' + (pathname === '/mi-cuenta' || pathname === '/login' ? ' active' : '')}
                    onClick={manejarClickCuenta}
                  >
                    <i className="bi bi-person-circle me-2"></i> Mi Cuenta
                  </button>
                </li>

                {esAdmin && (
                  <li className="nav-item mt-1">
                    <NavLink className={claseLink} to="/admin" onClick={cerrarMenu}>
                      <i className="bi bi-shield-lock me-2"></i> Panel Admin
                    </NavLink>
                  </li>
                )}
              </ul>

              <div className="mt-auto pt-3 border-top">
                <p className="mb-1 small text-secondary">Atención: 09:00 - 19:00 hrs</p>
                <p className="mb-0 small text-secondary">Teléfono: +56 9 3284 8760</p>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </nav>
    </header>
  )
}

export default Navbar