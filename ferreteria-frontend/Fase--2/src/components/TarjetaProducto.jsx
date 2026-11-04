import { useEffect, useState } from 'react'
import { formatearPrecio } from '../utils/formato'

function TarjetaProducto({ producto, onAgregar }) {
  const [agregado, setAgregado] = useState(false)
  const agotado = producto.stockTienda + producto.stockBodega === 0

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
        <img src={producto.imagen} className="card-img-top" alt={producto.nombre} />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title h6 fw-bold">{producto.nombre}</h5>
          <p className="card-text small text-muted flex-grow-1">{producto.descripcion}</p>
          <span className="fw-bold fs-6 mb-2 text-primary">{formatearPrecio(producto.precio)}</span>
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
