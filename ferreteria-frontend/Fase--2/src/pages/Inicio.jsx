import { Link } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

const BENEFICIOS = [
  { icono: 'bi-truck', titulo: 'Envíos Rápidos', texto: 'Despachamos directamente a tus obras dentro de nuestra zona de cobertura.' },
  { icono: 'bi-award', titulo: 'Calidad Garantizada', texto: 'Trabajamos solo con marcas líderes y certificadas en el sector construcción.' },
  { icono: 'bi-credit-card', titulo: 'Pagos Seguros', texto: 'Aceptamos tarjetas de débito, crédito y transferencias electrónicas.' },
]

function Inicio() {
  useTitulo('Ferretería Los Maestros - Inicio')

  return (
    <main>
      <section className="hero bg-dark text-white text-center py-5">
        <div className="container py-5">
          <h1 className="display-4 fw-bold">Construye tus proyectos con la mejor calidad</h1>
          <p className="lead mt-3 text-light">
            Herramientas, materiales y equipos profesionales con entrega hasta la puerta de tu hogar u obra.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
            <Link to="/catalogo" className="btn btn-warning btn-lg fw-bold">Ver Catálogo de Productos</Link>
            <Link to="/cobertura" className="btn btn-outline-light btn-lg fw-bold">Consultar Zonas de Cobertura</Link>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="text-center mb-4 fw-bold">¿Por qué elegir Ferretería Los Maestros?</h2>
        <div className="row g-4">
          {BENEFICIOS.map(({ icono, titulo, texto }) => (
            <div className="col-md-4" key={titulo}>
              <div className="card h-100 border-0 shadow-sm text-center p-4">
                <div className="card-body">
                  <div className="fs-1 text-warning mb-2"><i className={`bi ${icono}`}></i></div>
                  <h3 className="h5 card-title fw-bold">{titulo}</h3>
                  <p className="card-text text-muted">{texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Inicio
