import { useEffect, useState } from 'react'
import Aviso from './Aviso'
import FormularioDireccion from './FormularioDireccion'
import {
  MAX_DIRECCIONES,
  actualizarDireccion,
  agregarDireccion,
  eliminarDireccion,
  listarDirecciones,
  marcarPredeterminada,
} from '../services/direcciones'
import { DIRECCION_VACIA, erroresDireccion, textoDireccion } from '../utils/direccion'
import { enfocarPrimerError, hayErrores } from '../utils/validaciones'

const REVISAR_CAMPOS = { tipo: 'danger', texto: 'Revisa los campos marcados en rojo' }

// lista de direcciones guardadas del cliente (Mi Cuenta): agregar, editar, eliminar y elegir la predeterminada
function MisDirecciones({ usuario }) {
  const [direcciones, setDirecciones] = useState([])
  // null = solo la lista, 'nueva' = formulario para agregar, numero = id de la direccion que se esta editando
  const [editando, setEditando] = useState(null)
  const [formulario, setFormulario] = useState(DIRECCION_VACIA)
  const [intento, setIntento] = useState(false)
  const [porEliminar, setPorEliminar] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const errores = intento ? erroresDireccion(formulario) : {}
  const llena = direcciones.length >= MAX_DIRECCIONES

  useEffect(() => {
    listarDirecciones(usuario).then(setDirecciones)
  }, [usuario])

  const recargar = async () => setDirecciones(await listarDirecciones(usuario))

  const abrirFormulario = (direccion = null) => {
    setEditando(direccion ? direccion.id : 'nueva')
    setFormulario(direccion ? { ...DIRECCION_VACIA, ...direccion } : DIRECCION_VACIA)
    setIntento(false)
    setPorEliminar(null)
    setMensaje(null)
  }

  const cerrarFormulario = () => {
    setEditando(null)
    setIntento(false)
  }

  const guardar = async (evento) => {
    evento.preventDefault()
    setIntento(true)
    if (hayErrores(erroresDireccion(formulario))) {
      setMensaje(REVISAR_CAMPOS)
      enfocarPrimerError(evento.currentTarget)
      return
    }

    try {
      if (editando === 'nueva') await agregarDireccion(usuario, formulario)
      else await actualizarDireccion(usuario, editando, formulario)

      await recargar()
      setMensaje({ tipo: 'success', texto: editando === 'nueva' ? 'Dirección agregada' : 'Dirección actualizada' })
      cerrarFormulario()
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.message })
    }
  }

  const elegirPredeterminada = async (id) => {
    await marcarPredeterminada(usuario, id)
    await recargar()
    setMensaje({ tipo: 'success', texto: 'Dirección predeterminada actualizada' })
  }

  const eliminar = async (id) => {
    await eliminarDireccion(usuario, id)
    setPorEliminar(null)
    await recargar()
    setMensaje({ tipo: 'success', texto: 'Dirección eliminada' })
  }

  return (
    <section className="card shadow-sm mt-4" aria-labelledby="titulo-direcciones">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-1">
          <h2 id="titulo-direcciones" className="h5 fw-bold mb-0">Mis direcciones</h2>
          {editando === null && (
            <button type="button" className="btn btn-sm btn-success" disabled={llena} onClick={() => abrirFormulario()}>
              + Agregar dirección
            </button>
          )}
        </div>
        <p className="text-secondary small mb-3">
          La dirección predeterminada se selecciona sola al comprar. Puedes guardar hasta {MAX_DIRECCIONES}.
        </p>

        {direcciones.length === 0 && editando === null && (
          <p className="text-muted mb-0">Aún no tienes direcciones guardadas.</p>
        )}

        {editando === null && (
          <ul className="list-unstyled mb-0">
            {direcciones.map((d) => (
              <li key={d.id} className="border rounded p-3 mb-2">
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <div>
                    <p className="fw-bold mb-1">
                      {d.alias}
                      {d.predeterminada && <span className="badge bg-primary ms-2">Predeterminada</span>}
                    </p>
                    <p className="small mb-0">{textoDireccion(d)}</p>
                    {d.indicaciones && <p className="small text-muted mb-0">{d.indicaciones}</p>}
                  </div>

                  {porEliminar === d.id ? (
                    <div className="d-flex align-items-center gap-2">
                      <span className="small">¿Eliminar esta dirección?</span>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(d.id)}>Sí, eliminar</button>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPorEliminar(null)}>No</button>
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap align-items-start gap-2">
                      {!d.predeterminada && (
                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => elegirPredeterminada(d.id)}>
                          Usar como predeterminada
                        </button>
                      )}
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => abrirFormulario(d)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPorEliminar(d.id)}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {editando !== null && (
          <form onSubmit={guardar} noValidate>
            <h3 className="h6 fw-bold mb-1">{editando === 'nueva' ? 'Nueva dirección' : 'Editar dirección'}</h3>
            <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>
            <FormularioDireccion prefijo="cuenta-dir" valor={formulario} onChange={setFormulario} errores={errores} conAlias />
            <div className="d-flex gap-2 justify-content-end">
              <button type="button" className="btn btn-outline-secondary" onClick={cerrarFormulario}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar dirección</button>
            </div>
          </form>
        )}

        <Aviso mensaje={mensaje} />
      </div>
    </section>
  )
}

export default MisDirecciones
