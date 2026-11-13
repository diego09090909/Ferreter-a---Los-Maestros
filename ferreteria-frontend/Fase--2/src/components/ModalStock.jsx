import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Aviso from './Aviso'
import ErrorCampo from './ErrorCampo'
import { ajustarStock, reponerStock } from '../services/inventario'
import { claseCampo, erroresMovimientoStock, hayErrores } from '../utils/validaciones'

// modo 'reponer': suma unidades que llegaron a la bodega
// modo 'ajustar': corrige el stock al valor contado (merma, error de conteo)
function ModalStock({ producto, modo, onCerrar, onGuardado }) {
  const [cantidad, setCantidad] = useState('')
  const [intento, setIntento] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const errores = intento ? erroresMovimientoStock({ cantidad }, modo, producto.stock) : {}

  const esReponer = modo === 'reponer'
  const numero = Number(cantidad)
  const valido = cantidad !== '' && !hayErrores(erroresMovimientoStock({ cantidad }, modo, producto.stock))
  const stockNuevo = esReponer ? producto.stock + numero : numero

  const guardar = async (evento) => {
    evento.preventDefault()
    setIntento(true)
    if (!valido) return

    setGuardando(true)
    try {
      const actualizado = esReponer ? await reponerStock(producto.id, numero) : await ajustarStock(producto, numero)
      onGuardado(actualizado, esReponer ? `Se repusieron ${numero} unidades` : `Stock ajustado a ${numero} unidades`)
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
      setGuardando(false)
    }
  }

  return (
    <Modal show onHide={onCerrar} centered>
      <form onSubmit={guardar} noValidate>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title as="h2" className="h5 fw-bold">{esReponer ? 'Reponer stock' : 'Ajustar stock'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="fw-bold mb-1">{producto.nombre}</p>
          <p className="small text-secondary mb-3">
            Stock actual: <strong>{producto.stock}</strong> · Stock mínimo: {producto.stockMinimo}
          </p>

          <label htmlFor="stock-cantidad" className="form-label obligatorio">
            {esReponer ? 'Cantidad que llegó' : 'Stock contado'}
          </label>
          <input
            id="stock-cantidad"
            type="number"
            inputMode="numeric"
            min={esReponer ? 1 : 0}
            step="1"
            className={claseCampo('form-control', errores.cantidad)}
            required
            aria-invalid={Boolean(errores.cantidad)}
            aria-describedby="stock-cantidad-error stock-cantidad-ayuda"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
          <ErrorCampo id="stock-cantidad-error" mensaje={errores.cantidad} />
          <p id="stock-cantidad-ayuda" className="form-text mb-0">
            {esReponer
              ? 'Se suma al stock actual.'
              : 'Escribe lo que hay realmente en bodega; el sistema corrige la diferencia.'}
            {valido && ` Quedará en ${stockNuevo} unidades.`}
          </p>

          <Aviso mensaje={mensaje} />
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : esReponer ? 'Reponer' : 'Guardar ajuste'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ModalStock
