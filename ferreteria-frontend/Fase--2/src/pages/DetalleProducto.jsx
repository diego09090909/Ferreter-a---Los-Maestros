import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useTitulo } from '../hooks/useTitulo'
import { mensajeDeError } from '../services/api'
import { obtenerProducto } from '../services/catalogo'
import { formatearPrecio } from '../utils/formato'
import { imagenDe, SIN_IMAGEN } from '../utils/imagen'

function DetalleProducto() {
  // el id viene de la URL: /catalogo/15
  const { id } = useParams()
  const { agregar } = useCarrito()

  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [noExiste, setNoExiste] = useState(false)
  const [intento, setIntento] = useState(0)
  const [agregado, setAgregado] = useState(false)

  useTitulo(producto ? `${producto.nombre} - Ferretería Los Maestros` : 'Producto - Ferretería Los Maestros')

  useEffect(() => {
    let vigente = true

    obtenerProducto(id)
      .then((datos) => {
        if (vigente) setProducto(datos)
      })
      .catch((e) => {
        if (!vigente) return
        if (e.response?.status === 404) setNoExiste(true)
        else setError(mensajeDeError(e))
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [id, intento])

  useEffect(() => {
    if (!agregado) return
    const temporizador = setTimeout(() => setAgregado(false), 1000)
    return () => clearTimeout(temporizador)
  }, [agregado])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    setIntento((n) => n + 1)
  }

  const agregarAlCarrito = () => {
    agregar(producto)
    setAgregado(true)
  }

  if (cargando) {
    return (
      <main className="container py-5 text-center" role="status">
        <div className="spinner-border text-primary" aria-hidden="true"></div>
        <p className="text-muted small mt-2 mb-0">Cargando producto...</p>
      </main>
    )
  }

  if (noExiste) {
    return (
      <main className="container py-5 text-center">
        <i className="bi bi-box-seam display-1 text-secondary"></i>
        <h1 className="h3 fw-bold mt-3">Producto no encontrado</h1>
        <p className="text-secondary">El producto que buscas no existe o fue eliminado del catálogo.</p>
        <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      </main>
    )
  }

  let claseBoton = 'btn-primary'
  let textoBoton = 'Añadir al Carrito'
  if (!producto.disponible) {
    claseBoton = 'btn-secondary'
    textoBoton = 'Sin Stock'
  } else if (agregado) {
    claseBoton = 'btn-success'
    textoBoton = '¡Agregado!'
  }

  return (
    <main className="container py-4">
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/catalogo">Catálogo</Link></li>
          <li className="breadcrumb-item">{producto.categoriaEtiqueta}</li>
          <li className="breadcrumb-item active" aria-current="page">{producto.nombre}</li>
        </ol>
      </nav>

      <div className="bg-white rounded shadow-sm p-3 p-md-4">
        <div className="row g-4">
          <div className="col-md-5">
            <img
              src={imagenDe(producto)}
              alt={producto.nombre}
              className="img-fluid rounded border w-100 imagen-detalle"
              onError={(e) => {
                if (!e.currentTarget.src.endsWith(SIN_IMAGEN)) e.currentTarget.src = SIN_IMAGEN
              }}
            />
          </div>

          <div className="col-md-7 d-flex flex-column">
            <p className="text-secondary small mb-1">
              {producto.subcategoria} · Código {producto.codigo}
            </p>
            <h1 className="h3 fw-bold">{producto.nombre}</h1>
            {producto.marca && <p className="mb-3">Marca: <strong>{producto.marca}</strong></p>}

            <p className="fs-3 fw-bold text-primary mb-1">
              {formatearPrecio(producto.precio)}
              {producto.unidad && <small className="fs-6 text-muted fw-normal"> / {producto.unidad}</small>}
            </p>

            <p className="mb-3">
              {producto.disponible ? (
                <span className="badge bg-success">Disponible · {producto.stock} en stock</span>
              ) : (
                <span className="badge bg-secondary">Sin stock</span>
              )}
            </p>

            {producto.descripcion && <p className="text-muted">{producto.descripcion}</p>}

            <dl className="row small mb-4">
              <dt className="col-5 col-sm-4">Categoría</dt>
              <dd className="col-7 col-sm-8">{producto.categoriaEtiqueta}</dd>
              <dt className="col-5 col-sm-4">Subcategoría</dt>
              <dd className="col-7 col-sm-8">{producto.subcategoria}</dd>
              <dt className="col-5 col-sm-4">Unidad de venta</dt>
              <dd className="col-7 col-sm-8">{producto.unidad}</dd>
            </dl>

            <div className="d-flex flex-wrap gap-2 mt-auto">
              <button
                type="button"
                className={`btn ${claseBoton}`}
                disabled={!producto.disponible || agregado}
                onClick={agregarAlCarrito}
              >
                <i className="bi bi-cart-plus me-2"></i>{textoBoton}
              </button>
              <Link to="/catalogo" className="btn btn-outline-secondary">Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default DetalleProducto
