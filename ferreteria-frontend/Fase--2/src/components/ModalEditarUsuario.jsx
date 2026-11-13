import { useState } from 'react'
import { Modal } from 'react-bootstrap'
import Aviso from './Aviso'
import ErrorCampo from './ErrorCampo'
import { actualizarUsuarioAdmin } from '../services/usuarios'
import { ROLES_CREABLES_POR_ADMIN, etiquetaRol, valorRol } from '../utils/roles'
import { claseCampo, enfocarPrimerError, erroresEditarUsuario, hayErrores } from '../utils/validaciones'


function ModalEditarUsuario({ usuario, rutAdmin, onCerrar, onGuardado }) {
  const esPropia = usuario.rut === rutAdmin
  const [datos, setDatos] = useState({ nombre: usuario.nombre, email: usuario.email, rol: valorRol(usuario.rol) })
  const [intento, setIntento] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const errores = intento ? erroresEditarUsuario(datos) : {}
  const cambiar = (campo, valor) => setDatos({ ...datos, [campo]: valor })

  const guardar = async (evento) => {
    evento.preventDefault()
    setIntento(true)

    if (hayErrores(erroresEditarUsuario(datos))) {
      setMensaje({ tipo: 'danger', texto: 'Revisa los campos marcados en rojo' })
      enfocarPrimerError(evento.currentTarget)
      return
    }

    setGuardando(true)
    try {
      const editado = await actualizarUsuarioAdmin(usuario.rut, datos, rutAdmin)
      onGuardado(editado)
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
      setGuardando(false)
    }
  }

  const campo = (nombre, etiqueta, props = {}) => (
    <div className="mb-3">
      <label htmlFor={`editar-${nombre}`} className="form-label obligatorio">{etiqueta}</label>
      <input
        id={`editar-${nombre}`}
        className={claseCampo('form-control', errores[nombre])}
        required
        aria-invalid={Boolean(errores[nombre])}
        aria-describedby={`editar-${nombre}-error`}
        value={datos[nombre]}
        onChange={(e) => cambiar(nombre, e.target.value)}
        {...props}
      />
      <ErrorCampo id={`editar-${nombre}-error`} mensaje={errores[nombre]} />
    </div>
  )

  return (
    <Modal show onHide={onCerrar} centered>
      <form onSubmit={guardar} noValidate>
        <Modal.Header closeButton closeLabel="Cerrar">
          <Modal.Title as="h2" className="h5 fw-bold">Editar usuario</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>

          <div className="mb-3">
            <label htmlFor="editar-rut" className="form-label">RUT</label>
            <input id="editar-rut" className="form-control" value={usuario.rut} readOnly disabled />
          </div>

          {campo('nombre', 'Nombre completo', { type: 'text' })}
          {campo('email', 'Correo electrónico', { type: 'email' })}

          <div className="mb-1">
            <label htmlFor="editar-rol" className="form-label obligatorio">Rol</label>
            <select
              id="editar-rol"
              className={claseCampo('form-select', errores.rol)}
              required
              disabled={esPropia}
              aria-invalid={Boolean(errores.rol)}
              aria-describedby="editar-rol-error editar-rol-ayuda"
              value={datos.rol}
              onChange={(e) => cambiar('rol', e.target.value)}
            >
              {ROLES_CREABLES_POR_ADMIN.map((valor) => (
                <option key={valor} value={valor}>{etiquetaRol(valor)}</option>
              ))}
            </select>
            <ErrorCampo id="editar-rol-error" mensaje={errores.rol} />
            {esPropia && (
              <p id="editar-rol-ayuda" className="form-text mb-0">No puedes cambiar el rol de tu propia cuenta.</p>
            )}
          </div>

          <p className="text-secondary small mt-3 mb-0">
            La contraseña solo la puede cambiar el propio usuario desde Mi Cuenta.
          </p>

          <Aviso mensaje={mensaje} />
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default ModalEditarUsuario
