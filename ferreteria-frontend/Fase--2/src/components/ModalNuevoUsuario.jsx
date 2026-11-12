import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Aviso from './Aviso'
import ErrorCampo from './ErrorCampo'
import { crearUsuarioAdmin } from '../services/usuarios'
import { ROLES_CREABLES_POR_ADMIN, etiquetaRol } from '../utils/roles'
import { formatearMientrasEscribe } from '../utils/rut'
import { claseCampo, enfocarPrimerError, erroresNuevoUsuario, hayErrores } from '../utils/validaciones'

const VACIO = { nombre: '', rut: '', email: '', password: '', rol: '' }

function ModalNuevoUsuario({ mostrar, onCerrar, onCreado }) {
  const [datos, setDatos] = useState(VACIO)
  const [intento, setIntento] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const errores = intento ? erroresNuevoUsuario(datos) : {}
  const cambiar = (campo, valor) => setDatos({ ...datos, [campo]: valor })
  const cerrar = () => {
    setDatos(VACIO)
    setIntento(false)
    setMensaje(null)
    onCerrar()
  }

  const guardar = async (evento) => {
    evento.preventDefault()
    setIntento(true)

    if (hayErrores(erroresNuevoUsuario(datos))) {
      setMensaje({ tipo: 'danger', texto: 'Revisa los campos marcados en rojo' })
      enfocarPrimerError(evento.currentTarget)
      return
    }

    setGuardando(true)
    try {
      const creado = await crearUsuarioAdmin(datos)
      onCreado(creado)
      cerrar()
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
    } finally {
      setGuardando(false)
    }
  }

  const campo = (nombre, etiqueta, props = {}) => (
    <div className="mb-3">
      <label htmlFor={`nuevo-${nombre}`} className="form-label obligatorio">{etiqueta}</label>
      <input
        id={`nuevo-${nombre}`}
        className={claseCampo('form-control', errores[nombre])}
        required
        aria-invalid={Boolean(errores[nombre])}
        aria-describedby={`nuevo-${nombre}-error`}
        value={datos[nombre]}
        onChange={(e) => cambiar(nombre, e.target.value)}
        {...props}
      />
      <ErrorCampo id={`nuevo-${nombre}-error`} mensaje={errores[nombre]} />
    </div>
  )

  return (
    <Modal show={mostrar} onHide={cerrar} centered>
      <form onSubmit={guardar} noValidate>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title as="h2" className="h5 fw-bold">Nuevo usuario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-secondary small mb-3">
            Crea cuentas para el personal de la tienda. Los clientes se registran desde la tienda.
          </p>
          <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>

          {campo('nombre', 'Nombre completo', { type: 'text', placeholder: 'Nombre y apellido' })}
          {campo('rut', 'RUT', {
            type: 'text',
            placeholder: '12.345.678-5',
            onChange: (e) => cambiar('rut', formatearMientrasEscribe(e.target.value)),
          })}
          {campo('email', 'Correo electrónico', { type: 'email', placeholder: 'correo@losmaestros.cl' })}
          {campo('password', 'Contraseña', { type: 'password', placeholder: 'Entre 6 y 18 caracteres', autoComplete: 'new-password' })}

          <div className="mb-1">
            <label htmlFor="nuevo-rol" className="form-label obligatorio">Rol</label>
            <select
              id="nuevo-rol"
              className={claseCampo('form-select', errores.rol)}
              required
              aria-invalid={Boolean(errores.rol)}
              aria-describedby="nuevo-rol-error"
              value={datos.rol}
              onChange={(e) => cambiar('rol', e.target.value)}
            >
              <option value="">Selecciona...</option>
              {ROLES_CREABLES_POR_ADMIN.map((valor) => (
                <option key={valor} value={valor}>{etiquetaRol(valor)}</option>
              ))}
            </select>
            <ErrorCampo id="nuevo-rol-error" mensaje={errores.rol} />
          </div>

          <Aviso mensaje={mensaje} />
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={cerrar}>Cancelar</button>
          <button type="submit" className="btn btn-success" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ModalNuevoUsuario
