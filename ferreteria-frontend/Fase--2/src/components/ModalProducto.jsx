import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Aviso from './Aviso'
import ErrorCampo from './ErrorCampo'
import { actualizarProducto, crearProducto } from '../services/inventario'
import { formatearPrecio } from '../utils/formato'
import { claseCampo, enfocarPrimerError, erroresProducto, hayErrores } from '../utils/validaciones'

const VACIO = {
  codigo: '', nombre: '', descripcion: '', categoriaId: '', subcategoria: '', marca: '',
  unidad: '', precioCompra: '', precio: '', stock: '', stockMinimo: '', imagen: '',
}

// pasa un producto guardado a los textos del formulario
function aFormulario(producto) {
  if (!producto) return VACIO
  const texto = (valor) => (valor === null || valor === undefined ? '' : String(valor))
  return Object.fromEntries(Object.keys(VACIO).map((campo) => [campo, texto(producto[campo])]))
}

// crea un producto (producto = null) o edita uno del inventario.
// Al editar, el stock no se cambia aqui: para eso estan Reponer y Ajustar.
function ModalProducto({ producto, categorias, onCerrar, onGuardado }) {
  const esNuevo = !producto
  const [datos, setDatos] = useState(() => aFormulario(producto))
  const [intento, setIntento] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const errores = intento ? erroresProducto(datos) : {}
  const cambiar = (campo, valor) => setDatos({ ...datos, [campo]: valor })

  const margen = Number(datos.precio) - Number(datos.precioCompra)
  const hayMargen = datos.precio !== '' && datos.precioCompra !== '' && margen > 0

  const guardar = async (evento) => {
    evento.preventDefault()
    setIntento(true)

    if (hayErrores(erroresProducto(datos))) {
      setMensaje({ tipo: 'danger', texto: 'Revisa los campos marcados en rojo' })
      enfocarPrimerError(evento.currentTarget)
      return
    }

    setGuardando(true)
    try {
      const guardado = esNuevo
        ? await crearProducto(datos, categorias)
        : await actualizarProducto(producto.id, datos, categorias)
      onGuardado(guardado, esNuevo)
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
      setGuardando(false)
    }
  }

  const campo = (nombre, etiqueta, { obligatorio = true, columna = 'col-12 col-sm-6', ...props } = {}) => (
    <div className={columna}>
      <label htmlFor={`producto-${nombre}`} className={`form-label${obligatorio ? ' obligatorio' : ''}`}>{etiqueta}</label>
      <input
        id={`producto-${nombre}`}
        type="text"
        className={claseCampo('form-control', errores[nombre])}
        required={obligatorio}
        aria-invalid={Boolean(errores[nombre])}
        aria-describedby={`producto-${nombre}-error`}
        value={datos[nombre]}
        onChange={(e) => cambiar(nombre, e.target.value)}
        {...props}
      />
      <ErrorCampo id={`producto-${nombre}-error`} mensaje={errores[nombre]} />
    </div>
  )

  return (
    <Modal show onHide={onCerrar} centered size="lg">
      <form onSubmit={guardar} noValidate>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title as="h2" className="h5 fw-bold">{esNuevo ? 'Nuevo producto' : 'Editar producto'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>

          <div className="row g-3">
            {campo('codigo', 'Código', { columna: 'col-6 col-sm-3', placeholder: 'HE007', maxLength: 5 })}
            {campo('nombre', 'Nombre', { columna: 'col-12 col-sm-9', placeholder: 'Taladro inalámbrico 18V', maxLength: 100 })}

            <div className="col-12 col-sm-6">
              <label htmlFor="producto-categoriaId" className="form-label obligatorio">Categoría</label>
              <select
                id="producto-categoriaId"
                className={claseCampo('form-select', errores.categoriaId)}
                required
                aria-invalid={Boolean(errores.categoriaId)}
                aria-describedby="producto-categoriaId-error"
                value={datos.categoriaId}
                onChange={(e) => cambiar('categoriaId', e.target.value)}
              >
                <option value="">Selecciona...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <ErrorCampo id="producto-categoriaId-error" mensaje={errores.categoriaId} />
            </div>
            {campo('subcategoria', 'Subcategoría', { placeholder: 'Eléctricas', maxLength: 50 })}

            {campo('marca', 'Marca', { obligatorio: false, placeholder: 'Makita', maxLength: 50 })}
            {campo('unidad', 'Unidad', { placeholder: 'Unidad, Saco, Galón...', maxLength: 30 })}

            {campo('precioCompra', 'Precio de compra', { inputMode: 'numeric', placeholder: '30000' })}
            {campo('precio', 'Precio de venta', { inputMode: 'numeric', placeholder: '45990' })}
            <p className="col-12 small text-secondary mt-1 mb-0" aria-live="polite">
              {hayMargen ? `Margen por unidad: ${formatearPrecio(margen)}` : 'El precio de venta debe ser mayor al de compra.'}
            </p>

            {esNuevo ? (
              campo('stock', 'Stock inicial', { inputMode: 'numeric', placeholder: '20' })
            ) : (
              <div className="col-12 col-sm-6">
                <label htmlFor="producto-stock" className="form-label">Stock actual</label>
                <input id="producto-stock" className="form-control" value={datos.stock} readOnly disabled />
                <p className="form-text mb-0">Para cambiar el stock usa Reponer o Ajustar.</p>
              </div>
            )}
            {campo('stockMinimo', 'Stock mínimo', { inputMode: 'numeric', placeholder: '5' })}

            <div className="col-12">
              <label htmlFor="producto-descripcion" className="form-label">Descripción (opcional)</label>
              <textarea
                id="producto-descripcion"
                className={claseCampo('form-control', errores.descripcion)}
                rows="2"
                maxLength={500}
                aria-describedby="producto-descripcion-error"
                value={datos.descripcion}
                onChange={(e) => cambiar('descripcion', e.target.value)}
              />
              <ErrorCampo id="producto-descripcion-error" mensaje={errores.descripcion} />
            </div>
            {campo('imagen', 'Imagen (opcional)', { obligatorio: false, columna: 'col-12', placeholder: '/imagenes/HE007.webp', maxLength: 255 })}
          </div>

          {categorias.length === 0 && (
            <p className="alert alert-warning small mt-3 mb-0">
              No se pudieron cargar las categorías del catálogo. Revisa que ms-catalogo esté encendido.
            </p>
          )}
          <Aviso mensaje={mensaje} />
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando || categorias.length === 0}>
            {guardando ? 'Guardando...' : esNuevo ? 'Crear producto' : 'Guardar cambios'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ModalProducto
