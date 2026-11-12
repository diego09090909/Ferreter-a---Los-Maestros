import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatearPrecio } from '../utils/formato'
import { imagenDe, SIN_IMAGEN } from '../utils/imagen'

function TarjetaProducto({ producto, onAgregar }) {
  const [agregado, setAgregado] = useState(false)
  // "disponible" lo calcula ms-catalogo (stock > 0)
  const agotado = !producto.disponible

  useEffect(() => {
    if (!agregado) return
    const temporizador = setTimeout(() => setAgregado(false), 1000)
    return () => clearTimeout(temporizador)
  }, [agregado])

  const agregar = () => {
    onAgregar(producto)
    setAgregado(true)
  }

  let clase = 'btn-primary'
  let texto = 'Añadir al Carrito'
  if (agotado) {
    clase = 'btn-secondary'
    texto = 'Sin Stock'
  } else if (agregado) {
    clase = 'btn-success'
    texto = '¡Agregado!'
  }

  return (
    <div className="col">
      <div className="card h-100 border-0 shadow-sm">
        {/* la imagen y el nombre llevan al detalle; el link de la imagen se oculta al teclado
            y a los lectores de pantalla para que no se anuncie dos veces el mismo link */}
        <Link to={`/catalogo/${producto.id}`} tabIndex={-1} aria-hidden="true">
          <img
            src={imagenDe(producto)}
            className="card-img-top"
            alt={producto.nombre}
            // si la ruta guardada no existe, se cambia por la imagen generica (una sola vez)
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(SIN_IMAGEN)) e.currentTarget.src = SIN_IMAGEN
            }}
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title h6 fw-bold">
            <Link to={`/catalogo/${producto.id}`} className="text-reset text-decoration-none link-producto">
              {producto.nombre}
            </Link>
          </h5>
          <p className="card-text small text-muted flex-grow-1">
            {producto.descripcion ?? [producto.marca, producto.subcategoria].filter(Boolean).join(' · ')}
          </p>
          <span className="fw-bold fs-6 mb-2 text-primary">
            {formatearPrecio(producto.precio)}
            {producto.unidad && <small className="text-muted fw-normal"> / {producto.unidad}</small>}
          </span>
          <button
            type="button"
            className={`btn ${clase} btn-sm mt-auto`}
            disabled={agotado || agregado}
            onClick={agregar}
          >
            {texto}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TarjetaProducto
