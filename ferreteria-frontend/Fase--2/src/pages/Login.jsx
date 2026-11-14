import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Aviso from '../components/Aviso'
import ErrorCampo from '../components/ErrorCampo'
import FormularioDireccion from '../components/FormularioDireccion'
import { useAuth } from '../context/AuthContext'
import { useTitulo } from '../hooks/useTitulo'
import { mensajeDeError } from '../services/api'
import { DIRECCION_VACIA, erroresDireccion, limpiarDireccion } from '../utils/direccion'
import { ROLES } from '../utils/roles'
import { formatearMientrasEscribe, formatearRut, pareceRut } from '../utils/rut'
import { claseCampo, enfocarPrimerError, erroresIngreso, erroresRegistro, hayErrores } from '../utils/validaciones'

const REVISAR_CAMPOS = { texto: 'Revisa los campos marcados en rojo', tipo: 'danger' }

function Login() {
  useTitulo('Iniciar Sesión / Registro')

  const { ingresar, registrar } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [ingreso, setIngreso] = useState({ usuario: '', password: '' })
  const [registro, setRegistro] = useState({ nombre: '', rut: '', email: '', password: '' })
  const [direccionRegistro, setDireccionRegistro] = useState(DIRECCION_VACIA)
  const [mensajeIngreso, setMensajeIngreso] = useState(null)
  const [mensajeRegistro, setMensajeRegistro] = useState(null)
  const [intentoIngreso, setIntentoIngreso] = useState(false)
  const [intentoRegistro, setIntentoRegistro] = useState(false)
  const errIngreso = intentoIngreso ? erroresIngreso(ingreso) : {}
  const errRegistro = intentoRegistro ? erroresRegistro(registro) : {}
  const errDireccion = intentoRegistro ? erroresDireccion(direccionRegistro) : {}

  const temporizador = useRef(null)
  useEffect(() => () => clearTimeout(temporizador.current), [])
  const irA = (ruta) => {
    temporizador.current = setTimeout(() => navigate(ruta), 1200)
  }

  const cambiarUsuarioIngreso = (valor) => {
    setIngreso({ ...ingreso, usuario: pareceRut(valor) ? formatearMientrasEscribe(valor) : valor })
  }

  const entrar = async (evento) => {
    evento.preventDefault()

    setIntentoIngreso(true)
    if (hayErrores(erroresIngreso(ingreso))) {
      setMensajeIngreso(REVISAR_CAMPOS)
      enfocarPrimerError(evento.currentTarget)
      return
    }

    try {
      const usuario = await ingresar(ingreso.usuario.trim(), ingreso.password)
      setMensajeIngreso({ texto: `Bienvenido ${usuario.nombre}, entrando al sitio...`, tipo: 'success' })
      irA(usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.VENDEDOR ? '/admin' : '/')
    } catch (error) {
      const texto = error.response?.status === 401 ? 'Usuario o contraseña incorrectos' : mensajeDeError(error)
      setMensajeIngreso({ texto, tipo: 'danger' })
    }
  }

  const registrarse = async (evento) => {
    evento.preventDefault()

    setIntentoRegistro(true)
    if (hayErrores({ ...erroresRegistro(registro), ...erroresDireccion(direccionRegistro) })) {
      setMensajeRegistro(REVISAR_CAMPOS)
      enfocarPrimerError(evento.currentTarget)
      return
    }

    try {
      const usuario = await registrar({
        nombre: registro.nombre.trim(),
        rut: formatearRut(registro.rut.trim()).replace(/\./g, ''),
        email: registro.email.trim(),
        password: registro.password,
        direccion: limpiarDireccion(direccionRegistro),
      })
      setMensajeRegistro({ texto: `Cuenta creada correctamente. Bienvenido ${usuario.nombre}`, tipo: 'success' })
      setRegistro({ nombre: '', rut: '', email: '', password: '' })
      setDireccionRegistro(DIRECCION_VACIA)
      setIntentoRegistro(false)
      irA('/')
    } catch (error) {
      setMensajeRegistro({ texto: mensajeDeError(error), tipo: 'danger' })
    }
  }

  return (
    <main className="container py-4">
      <h1 className="h3 fw-bold mb-4">INICIAR SESIÓN / REGISTRO</h1>

      {state?.accesoDenegado && (
        <div className="alert alert-warning" role="alert">
          Acceso denegado. Debe iniciar sesión con una cuenta de Administrador o Vendedor.
        </div>
      )}

      <div className="row g-4 justify-content-center">

        <div className="col-lg-5 col-md-6">
          <div className="card h-100 shadow-sm tarjeta-cuenta">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-center mb-1">Ingresa</h2>
              <p className="text-secondary small text-center mb-1">Usa tu RUT o tu correo registrado.</p>
              <p className="text-secondary small text-center mb-4 nota-obligatorios">Campos obligatorios</p>

              <form onSubmit={entrar} noValidate>
                <div className="mb-3">
                  <label htmlFor="ingreso-usuario" className="form-label obligatorio">RUT o correo</label>
                  <input
                    type="text"
                    className={claseCampo('form-control', errIngreso.usuario)}
                    id="ingreso-usuario"
                    placeholder="11.111.111-1 o correo@ejemplo.cl"
                    autoComplete="username"
                    required
                    aria-invalid={Boolean(errIngreso.usuario)}
                    aria-describedby="ingreso-usuario-error"
                    value={ingreso.usuario}
                    onChange={(e) => cambiarUsuarioIngreso(e.target.value)}
                  />
                  <ErrorCampo id="ingreso-usuario-error" mensaje={errIngreso.usuario} />
                </div>

                <div className="mb-4">
                  <label htmlFor="ingreso-password" className="form-label obligatorio">Contraseña</label>
                  <input
                    type="password"
                    className={claseCampo('form-control', errIngreso.password)}
                    id="ingreso-password"
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errIngreso.password)}
                    aria-describedby="ingreso-password-error"
                    value={ingreso.password}
                    onChange={(e) => setIngreso({ ...ingreso, password: e.target.value })}
                  />
                  <ErrorCampo id="ingreso-password-error" mensaje={errIngreso.password} />
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">Entrar</button>
                </div>

                <Aviso mensaje={mensajeIngreso} />
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5 col-md-6">
          <div className="card h-100 shadow-sm tarjeta-cuenta">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-center mb-1">Regístrate</h2>
              <p className="text-secondary small text-center mb-1">Crea tu cuenta para comprar en línea.</p>
              <p className="text-secondary small text-center mb-4 nota-obligatorios">Campos obligatorios</p>

              <form onSubmit={registrarse} noValidate>
                <div className="mb-3">
                  <label htmlFor="registro-nombre" className="form-label obligatorio">Nombre completo</label>
                  <input
                    type="text"
                    className={claseCampo('form-control', errRegistro.nombre)}
                    id="registro-nombre"
                    required
                    aria-invalid={Boolean(errRegistro.nombre)}
                    aria-describedby="registro-nombre-error"
                    placeholder="Nombre y apellido"
                    value={registro.nombre}
                    onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
                  />
                  <ErrorCampo id="registro-nombre-error" mensaje={errRegistro.nombre} />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-rut" className="form-label obligatorio">RUT</label>
                  <input
                    type="text"
                    className={claseCampo('form-control', errRegistro.rut)}
                    id="registro-rut"
                    required
                    aria-invalid={Boolean(errRegistro.rut)}
                    aria-describedby="registro-rut-error"
                    placeholder="12.345.678-5"
                    value={registro.rut}
                    onChange={(e) => setRegistro({ ...registro, rut: formatearMientrasEscribe(e.target.value) })}
                  />
                  <ErrorCampo id="registro-rut-error" mensaje={errRegistro.rut} />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-email" className="form-label obligatorio">Correo electrónico</label>
                  <input
                    type="email"
                    className={claseCampo('form-control', errRegistro.email)}
                    id="registro-email"
                    required
                    aria-invalid={Boolean(errRegistro.email)}
                    aria-describedby="registro-email-error"
                    placeholder="correo@ejemplo.cl"
                    value={registro.email}
                    onChange={(e) => setRegistro({ ...registro, email: e.target.value })}
                  />
                  <ErrorCampo id="registro-email-error" mensaje={errRegistro.email} />
                </div>

                <div className="mb-4">
                  <label htmlFor="registro-password" className="form-label obligatorio">Contraseña</label>
                  <input
                    type="password"
                    className={claseCampo('form-control', errRegistro.password)}
                    id="registro-password"
                    required
                    aria-invalid={Boolean(errRegistro.password)}
                    aria-describedby="registro-password-error"
                    placeholder="Entre 6 y 18 caracteres"
                    autoComplete="new-password"
                    value={registro.password}
                    onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
                  />
                  <ErrorCampo id="registro-password-error" mensaje={errRegistro.password} />
                </div>

                <h3 className="h6 fw-bold border-top pt-3 mb-1">Dirección de entrega</h3>
                <p className="text-secondary small mb-3">La usaremos para los despachos a domicilio.</p>

                <FormularioDireccion
                  prefijo="registro-dir"
                  valor={direccionRegistro}
                  onChange={setDireccionRegistro}
                  errores={errDireccion}
                />

                <div className="d-grid">
                  <button type="submit" className="btn btn-success">Crear Cuenta</button>
                </div>

                <Aviso mensaje={mensajeRegistro} />
              </form>
            </div>
          </div>
        </div>
      </div>

      <p className="text-secondary small text-center mt-4 mb-0">
        Proyecto académico, no ingreses información real.
      </p>
    </main>
  )
}

export default Login