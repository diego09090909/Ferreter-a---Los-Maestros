import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso'
import ErrorCampo from '../components/ErrorCampo'
import MisDirecciones from '../components/MisDirecciones'
import { useAuth } from '../context/AuthContext'
import { useTitulo } from '../hooks/useTitulo'
import { mensajeDeError } from '../services/api'
import { obtenerUsuarios } from '../services/usuarios'
import { ENTREGAS_VENTA, ESTADOS_VENTA, obtenerMisVentas } from '../services/ventas'
import { leer } from '../utils/storage'
import { formatearPrecio } from '../utils/formato'
import { claseCampo, enfocarPrimerError, erroresClaves, erroresDatos, hayErrores } from '../utils/validaciones'

const REVISAR_CAMPOS = { tipo: 'danger', texto: 'Revisa los campos marcados en rojo' }

function MiCuenta() {
  useTitulo('Mi Cuenta - Ferretería Los Maestros')

  const { usuario, esAdmin, esVendedor, actualizarUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState({ nombre: usuario.nombre, email: usuario.email })
  const [claves, setClaves] = useState({ actual: '', nueva: '', repetir: '' })
  const [msgDatos, setMsgDatos] = useState(null)
  const [msgClave, setMsgClave] = useState(null)

  // errores por campo: aparecen despues del primer intento y se actualizan al escribir
  const [intentoDatos, setIntentoDatos] = useState(false)
  const [intentoClave, setIntentoClave] = useState(false)
  const errDatos = intentoDatos ? erroresDatos(datos) : {}
  const errClave = intentoClave ? erroresClaves(claves) : {}

  const [pedidosLocales] = useState(() =>
    leer('pedidos', [])
      .filter((p) => (p.rut ? p.rut === usuario.rut : p.cliente === usuario.nombre))
      .reverse(),
  )

  const [ventas, setVentas] = useState(null)
  const [errorVentas, setErrorVentas] = useState(null)
  const cargandoVentas = Boolean(usuario.token) && ventas === null && !errorVentas

  useEffect(() => {
    if (!usuario.token) return
    obtenerMisVentas()
      .then(setVentas)
      .catch((error) => setErrorVentas(mensajeDeError(error)))
  }, [usuario.token])

  const pedidos = ventas
    ? ventas.map((v) => ({
        id: v.id,
        tipoEntrega: ENTREGAS_VENTA[v.tipoEntrega] ?? v.tipoEntrega,
        tipoPago: '—',
        total: v.total,
        estado: ESTADOS_VENTA[v.estado] ?? v.estado,
      }))
    : pedidosLocales

  const guardarDatos = (evento) => {
    evento.preventDefault()
    const nombre = datos.nombre.trim()
    const email = datos.email.trim()

    setIntentoDatos(true)
    if (hayErrores(erroresDatos(datos))) {
      setMsgDatos(REVISAR_CAMPOS)
      enfocarPrimerError(evento.currentTarget)
      return
    }

    const repetido = obtenerUsuarios().some(
      (u) => u.rut !== usuario.rut && (u.email ?? '').toLowerCase() === email.toLowerCase(),
    )
    if (repetido) {
      setMsgDatos({ tipo: 'danger', texto: 'Ya existe otra cuenta con ese correo' })
      return
    }

    actualizarUsuario({ nombre, email })
    setMsgDatos({ tipo: 'success', texto: 'Tus datos se actualizaron correctamente' })
  }

  const cambiarClave = (evento) => {
    evento.preventDefault()
    const error = (texto) => setMsgClave({ tipo: 'danger', texto })

    setIntentoClave(true)
    if (hayErrores(erroresClaves(claves))) {
      setMsgClave(REVISAR_CAMPOS)
      enfocarPrimerError(evento.currentTarget)
      return
    }
    if (claves.actual !== usuario.password) return error('La contraseña actual no es correcta')

    actualizarUsuario({ password: claves.nueva })
    setClaves({ actual: '', nueva: '', repetir: '' })
    setIntentoClave(false)
    setMsgClave({ tipo: 'success', texto: 'Contraseña actualizada correctamente' })
  }

  const salir = () => {
  
    navigate('/')
    cerrarSesion()
  }

  return (
    <main className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h3 fw-bold mb-0">MI CUENTA</h1>
        <div className="d-flex gap-2">
          {(esAdmin || esVendedor) && (
            <Link to="/admin" className="btn btn-outline-primary">
              <i className="bi bi-shield-lock me-2"></i>{esAdmin ? 'Panel Admin' : 'Panel Vendedor'}
            </Link>
          )}
          <button type="button" className="btn btn-outline-danger" onClick={salir}>
            <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
          </button>
        </div>
      </div>

      <div className="row g-4">
      
        <div className="col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center p-4">
              <i className="bi bi-person-circle display-1 text-secondary"></i>
              <h2 className="h5 fw-bold mt-2 mb-1">{usuario.nombre}</h2>
              <span className={`badge ${esAdmin ? 'bg-primary' : 'bg-secondary'} mb-3`}>{usuario.rol}</span>
              <ul className="list-unstyled text-start small mb-0">
                <li className="mb-2"><strong>RUT:</strong> {usuario.rut}</li>
                <li><strong>Correo:</strong> {usuario.email}</li>
              </ul>
            </div>
          </div>
        </div>

      
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-1">Mis datos</h2>
              <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>
              <form onSubmit={guardarDatos} noValidate>
                <div className="mb-3">
                  <label htmlFor="cuenta-nombre" className="form-label obligatorio">Nombre completo</label>
                  <input
                    id="cuenta-nombre"
                    type="text"
                    className={claseCampo('form-control', errDatos.nombre)}
                    required
                    aria-invalid={Boolean(errDatos.nombre)}
                    aria-describedby="cuenta-nombre-error"
                    value={datos.nombre}
                    onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  />
                  <ErrorCampo id="cuenta-nombre-error" mensaje={errDatos.nombre} />
                </div>
                <div className="mb-3">
                  <label htmlFor="cuenta-rut" className="form-label">RUT</label>
                  <input id="cuenta-rut" type="text" className="form-control" value={usuario.rut} readOnly disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="cuenta-email" className="form-label obligatorio">Correo electrónico</label>
                  <input
                    id="cuenta-email"
                    type="email"
                    className={claseCampo('form-control', errDatos.email)}
                    required
                    aria-invalid={Boolean(errDatos.email)}
                    aria-describedby="cuenta-email-error"
                    value={datos.email}
                    onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  />
                  <ErrorCampo id="cuenta-email-error" mensaje={errDatos.email} />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Guardar cambios</button>
                </div>
                <Aviso mensaje={msgDatos} />
              </form>
            </div>
          </div>
        </div>

      
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold mb-1">Cambiar contraseña</h2>
              <p className="text-secondary small mb-3 nota-obligatorios">Campos obligatorios</p>
              <form onSubmit={cambiarClave} noValidate>
                <div className="mb-3">
                  <label htmlFor="clave-actual" className="form-label obligatorio">Contraseña actual</label>
                  <input
                    id="clave-actual"
                    type="password"
                    className={claseCampo('form-control', errClave.actual)}
                    required
                    aria-invalid={Boolean(errClave.actual)}
                    aria-describedby="clave-actual-error"
                    autoComplete="current-password"
                    value={claves.actual}
                    onChange={(e) => setClaves({ ...claves, actual: e.target.value })}
                  />
                  <ErrorCampo id="clave-actual-error" mensaje={errClave.actual} />
                </div>
                <div className="mb-3">
                  <label htmlFor="clave-nueva" className="form-label obligatorio">Nueva contraseña</label>
                  <input
                    id="clave-nueva"
                    type="password"
                    className={claseCampo('form-control', errClave.nueva)}
                    required
                    aria-invalid={Boolean(errClave.nueva)}
                    aria-describedby="clave-nueva-error"
                    placeholder="Entre 6 y 18 caracteres"
                    autoComplete="new-password"
                    value={claves.nueva}
                    onChange={(e) => setClaves({ ...claves, nueva: e.target.value })}
                  />
                  <ErrorCampo id="clave-nueva-error" mensaje={errClave.nueva} />
                </div>
                <div className="mb-3">
                  <label htmlFor="clave-repetir" className="form-label obligatorio">Repetir nueva contraseña</label>
                  <input
                    id="clave-repetir"
                    type="password"
                    className={claseCampo('form-control', errClave.repetir)}
                    required
                    aria-invalid={Boolean(errClave.repetir)}
                    aria-describedby="clave-repetir-error"
                    autoComplete="new-password"
                    value={claves.repetir}
                    onChange={(e) => setClaves({ ...claves, repetir: e.target.value })}
                  />
                  <ErrorCampo id="clave-repetir-error" mensaje={errClave.repetir} />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-success">Actualizar contraseña</button>
                </div>
                <Aviso mensaje={msgClave} />
              </form>
            </div>
          </div>
        </div>
      </div>

  
      {!esAdmin && <MisDirecciones usuario={usuario} />}

      {/* Pedidos */}
      <section className="card shadow-sm mt-4">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">Mis pedidos</h2>
          {errorVentas ? (
            <p className="text-danger mb-0">No se pudo cargar tu historial: {errorVentas}</p>
          ) : cargandoVentas ? (
            <p className="text-muted mb-0">Cargando tus pedidos...</p>
          ) : pedidos.length === 0 ? (
            <p className="text-muted mb-0">
              Aún no tienes pedidos. Ve al <Link to="/catalogo">catálogo</Link> para comprar.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle small mb-0 tabla-apilable">
                <thead className="table-dark">
                  <tr>
                    <th>N° Pedido</th>
                    <th>Entrega</th>
                    <th>Pago</th>
                    <th className="text-end">Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p, i) => (
                    <tr key={`${p.id}-${i}`}>
                      <td data-label="N° Pedido">#PED-{p.id}</td>
                      <td data-label="Entrega">{p.tipoEntrega}</td>
                      <td data-label="Pago">{p.tipoPago}</td>
                      <td data-label="Total" className="text-end">{formatearPrecio(p.total)}</td>
                      <td data-label="Estado"><span className="badge bg-info text-dark">{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default MiCuenta