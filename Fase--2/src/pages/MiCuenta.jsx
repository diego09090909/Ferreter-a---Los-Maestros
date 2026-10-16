import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormularioDireccion from '../components/FormularioDireccion'
import { useAuth } from '../context/AuthContext'
import { useTitulo } from '../hooks/useTitulo'
import { obtenerUsuarios } from '../services/usuarios'
import { DIRECCION_VACIA, errorDireccion, limpiarDireccion } from '../utils/direccion'
import { leer } from '../utils/storage'
import { formatearPrecio } from '../utils/formato'
import { correoValido, nombreValido, passwordValida, PASSWORD_MAXIMA, PASSWORD_MINIMA } from '../utils/validaciones'

function Aviso({ mensaje }) {
  if (!mensaje) return null
  return (
    <div className={`alert alert-${mensaje.tipo} mt-3 mb-0`} role="alert">
      {mensaje.texto}
    </div>
  )
}

function MiCuenta() {
  useTitulo('Mi Cuenta - Ferretería Los Maestros')

  const { usuario, esAdmin, actualizarUsuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const [datos, setDatos] = useState({ nombre: usuario.nombre, email: usuario.email })
  const [claves, setClaves] = useState({ actual: '', nueva: '', repetir: '' })
  const [msgDatos, setMsgDatos] = useState(null)
  const [msgClave, setMsgClave] = useState(null)
  const [direccion, setDireccion] = useState(() => ({ ...DIRECCION_VACIA, ...usuario.direccion }))
  const [msgDireccion, setMsgDireccion] = useState(null)

  const [pedidos] = useState(() =>
    leer('pedidos', [])
      .filter((p) => (p.rut ? p.rut === usuario.rut : p.cliente === usuario.nombre))
      .reverse(),
  )

  const guardarDatos = (evento) => {
    evento.preventDefault()
    const nombre = datos.nombre.trim()
    const email = datos.email.trim()

    if (!nombreValido(nombre)) {
      setMsgDatos({ tipo: 'danger', texto: 'El nombre debe tener al menos 3 caracteres' })
      return
    }
    if (!correoValido(email)) {
      setMsgDatos({ tipo: 'danger', texto: 'El correo no tiene un formato válido' })
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

  const guardarDireccion = (evento) => {
    evento.preventDefault()
    const error = errorDireccion(direccion)
    if (error) {
      setMsgDireccion({ tipo: 'danger', texto: error })
      return
    }

    const limpia = limpiarDireccion(direccion)
    actualizarUsuario({ direccion: limpia })
    setDireccion(limpia)
    setMsgDireccion({ tipo: 'success', texto: 'Tu dirección de entrega se actualizó correctamente' })
  }

  const cambiarClave = (evento) => {
    evento.preventDefault()
    const error = (texto) => setMsgClave({ tipo: 'danger', texto })

    if (!claves.actual || !claves.nueva || !claves.repetir) return error('Debe completar los tres campos')
    if (claves.actual !== usuario.password) return error('La contraseña actual no es correcta')
    if (!passwordValida(claves.nueva)) {
      return error(`La nueva contraseña debe tener entre ${PASSWORD_MINIMA} y ${PASSWORD_MAXIMA} caracteres`)
    }
    if (claves.nueva !== claves.repetir) return error('Las contraseñas nuevas no coinciden')
    if (claves.nueva === claves.actual) return error('La nueva contraseña debe ser distinta a la actual')

    actualizarUsuario({ password: claves.nueva })
    setClaves({ actual: '', nueva: '', repetir: '' })
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
          {esAdmin && (
            <Link to="/admin" className="btn btn-outline-primary">
              <i className="bi bi-shield-lock me-2"></i>Panel Admin
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
              <h2 className="h5 fw-bold mb-3">Mis datos</h2>
              <form onSubmit={guardarDatos} noValidate>
                <div className="mb-3">
                  <label htmlFor="cuenta-nombre" className="form-label">Nombre completo</label>
                  <input
                    id="cuenta-nombre"
                    type="text"
                    className="form-control"
                    value={datos.nombre}
                    onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="cuenta-rut" className="form-label">RUT</label>
                  <input id="cuenta-rut" type="text" className="form-control" value={usuario.rut} readOnly disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="cuenta-email" className="form-label">Correo electrónico</label>
                  <input
                    id="cuenta-email"
                    type="email"
                    className="form-control"
                    value={datos.email}
                    onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                  />
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
              <h2 className="h5 fw-bold mb-3">Cambiar contraseña</h2>
              <form onSubmit={cambiarClave} noValidate>
                <div className="mb-3">
                  <label htmlFor="clave-actual" className="form-label">Contraseña actual</label>
                  <input
                    id="clave-actual"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    value={claves.actual}
                    onChange={(e) => setClaves({ ...claves, actual: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="clave-nueva" className="form-label">Nueva contraseña</label>
                  <input
                    id="clave-nueva"
                    type="password"
                    className="form-control"
                    placeholder="Entre 6 y 18 caracteres"
                    autoComplete="new-password"
                    value={claves.nueva}
                    onChange={(e) => setClaves({ ...claves, nueva: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="clave-repetir" className="form-label">Repetir nueva contraseña</label>
                  <input
                    id="clave-repetir"
                    type="password"
                    className="form-control"
                    autoComplete="new-password"
                    value={claves.repetir}
                    onChange={(e) => setClaves({ ...claves, repetir: e.target.value })}
                  />
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

   
      {!esAdmin && (
        <section className="card shadow-sm mt-4">
          <div className="card-body p-4">
            <h2 className="h5 fw-bold mb-1">Mi dirección de entrega</h2>
            <p className="text-secondary small mb-3">
              Se usa para completar tus compras con despacho a domicilio. Puedes cambiarla cuando quieras.
            </p>
            <form onSubmit={guardarDireccion} noValidate>
              <FormularioDireccion prefijo="cuenta-dir" valor={direccion} onChange={setDireccion} />
              <div className="d-grid d-md-flex justify-content-md-end">
                <button type="submit" className="btn btn-primary">Guardar dirección</button>
              </div>
              <Aviso mensaje={msgDireccion} />
            </form>
          </div>
        </section>
      )}

      {/* Pedidos */}
      <section className="card shadow-sm mt-4">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-3">Mis pedidos</h2>
          {pedidos.length === 0 ? (
            <p className="text-muted mb-0">
              Aún no tienes pedidos. Ve al <Link to="/catalogo">catálogo</Link> para comprar.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped align-middle small mb-0">
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
                      <td>#PED-{p.id}</td>
                      <td>{p.tipoEntrega}</td>
                      <td>{p.tipoPago}</td>
                      <td className="text-end">{formatearPrecio(p.total)}</td>
                      <td><span className="badge bg-info text-dark">{p.estado}</span></td>
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
