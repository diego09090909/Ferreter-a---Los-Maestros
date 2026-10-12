import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTitulo } from '../hooks/useTitulo'
import { guardarUsuarios, obtenerUsuarios } from '../services/usuarios'
import { formatearMientrasEscribe, formatearRut, limpiarRut, pareceRut, rutEsValido } from '../utils/rut'

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function Aviso({ mensaje }) {
  if (!mensaje) return null
  return (
    <div className={`alert alert-${mensaje.tipo} mt-3`} role="alert">
      {mensaje.texto}
    </div>
  )
}

function Login() {
  useTitulo('Iniciar Sesión / Registro')

  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()

  const [ingreso, setIngreso] = useState({ usuario: '', password: '' })
  const [registro, setRegistro] = useState({ nombre: '', rut: '', email: '', password: '' })
  const [mensajeIngreso, setMensajeIngreso] = useState(null)
  const [mensajeRegistro, setMensajeRegistro] = useState(null)


  const temporizador = useRef(null)
  useEffect(() => () => clearTimeout(temporizador.current), [])
  const irA = (ruta) => {
    temporizador.current = setTimeout(() => navigate(ruta), 1200)
  }

  const cambiarUsuarioIngreso = (valor) => {

    setIngreso({ ...ingreso, usuario: pareceRut(valor) ? formatearMientrasEscribe(valor) : valor })
  }

  const entrar = (evento) => {
    evento.preventDefault()
    const usuarioEscrito = ingreso.usuario.trim()

    if (usuarioEscrito === '' || ingreso.password === '') {
      setMensajeIngreso({ texto: 'Debe completar su RUT o correo y su contraseña', tipo: 'danger' })
      return
    }

    // buscar la cuenta por correo o por rut
    const encontrado = obtenerUsuarios().find(
      (u) =>
        (u.email ?? '').toLowerCase() === usuarioEscrito.toLowerCase() ||
        limpiarRut(u.rut ?? '') === limpiarRut(usuarioEscrito),
    )

    if (!encontrado) {
      setMensajeIngreso({ texto: 'No existe una cuenta con ese RUT o correo', tipo: 'danger' })
      return
    }

    if (encontrado.password !== ingreso.password) {
      setMensajeIngreso({ texto: 'La contraseña no es correcta', tipo: 'danger' })
      return
    }

    iniciarSesion(encontrado)
    setMensajeIngreso({ texto: `Bienvenido ${encontrado.nombre}, entrando al sitio...`, tipo: 'success' })
    irA(encontrado.rol === 'Administrador' ? '/admin' : '/')
  }

  const registrarse = (evento) => {
    evento.preventDefault()
    const nombre = registro.nombre.trim()
    const rut = registro.rut.trim()
    const correo = registro.email.trim()
    const { password } = registro

    const error = (texto) => setMensajeRegistro({ texto, tipo: 'danger' })

    if (!nombre || !rut || !correo || !password) return error('Debe completar todos los campos')
    if (nombre.length < 3) return error('El nombre debe tener al menos 3 caracteres')
    if (!rutEsValido(rut)) return error('El RUT no es válido, revise el dígito verificador')
    if (!PATRON_CORREO.test(correo)) return error('El correo no tiene un formato válido')
    if (password.length < 6 || password.length > 18) return error('La contraseña debe tener entre 6 y 18 caracteres')

    const usuarios = obtenerUsuarios()
    const repetido = usuarios.some(
      (u) =>
        limpiarRut(u.rut ?? '') === limpiarRut(rut) ||
        (u.email ?? '').toLowerCase() === correo.toLowerCase(),
    )
    if (repetido) return error('Ya existe una cuenta con ese RUT o ese correo')

    const nuevoUsuario = { rut: formatearRut(rut), nombre, email: correo, password, rol: 'Cliente' }
    guardarUsuarios([...usuarios, nuevoUsuario])

   
    iniciarSesion(nuevoUsuario)
    setMensajeRegistro({ texto: `Cuenta creada correctamente. Bienvenido ${nombre}`, tipo: 'success' })
    setRegistro({ nombre: '', rut: '', email: '', password: '' })
    irA('/')
  }

  return (
    <main className="container py-4">
      <h1 className="h3 fw-bold mb-4">INICIAR SESIÓN / REGISTRO</h1>

      {state?.accesoDenegado && (
        <div className="alert alert-warning" role="alert">
          Acceso denegado. Debe iniciar sesión con una cuenta de Administrador.
        </div>
      )}

      <div className="row g-4 justify-content-center">
     
        <div className="col-lg-5 col-md-6">
          <div className="card h-100 shadow-sm tarjeta-cuenta">
            <div className="card-body p-4">
              <h2 className="h5 fw-bold text-center mb-1">Ingresa</h2>
              <p className="text-secondary small text-center mb-4">Usa tu RUT o tu correo registrado.</p>

              <form onSubmit={entrar} noValidate>
                <div className="mb-3">
                  <label htmlFor="ingreso-usuario" className="form-label">RUT o correo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ingreso-usuario"
                    placeholder="11.111.111-1 o correo@ejemplo.cl"
                    autoComplete="username"
                    value={ingreso.usuario}
                    onChange={(e) => cambiarUsuarioIngreso(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="ingreso-password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="ingreso-password"
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    value={ingreso.password}
                    onChange={(e) => setIngreso({ ...ingreso, password: e.target.value })}
                  />
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
              <p className="text-secondary small text-center mb-4">Crea tu cuenta para comprar en línea.</p>

              <form onSubmit={registrarse} noValidate>
                <div className="mb-3">
                  <label htmlFor="registro-nombre" className="form-label">Nombre completo</label>
                  <input
                    type="text"
                    className="form-control"
                    id="registro-nombre"
                    placeholder="Nombre y apellido"
                    value={registro.nombre}
                    onChange={(e) => setRegistro({ ...registro, nombre: e.target.value })}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-rut" className="form-label">RUT</label>
                  <input
                    type="text"
                    className="form-control"
                    id="registro-rut"
                    placeholder="12.345.678-5"
                    value={registro.rut}
                    onChange={(e) => setRegistro({ ...registro, rut: formatearMientrasEscribe(e.target.value) })}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="registro-email" className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    id="registro-email"
                    placeholder="correo@ejemplo.cl"
                    value={registro.email}
                    onChange={(e) => setRegistro({ ...registro, email: e.target.value })}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="registro-password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="registro-password"
                    placeholder="Entre 6 y 18 caracteres"
                    autoComplete="new-password"
                    value={registro.password}
                    onChange={(e) => setRegistro({ ...registro, password: e.target.value })}
                  />
                </div>

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
        Tus datos se guardan solo en este navegador. Proyecto académico, no ingreses información real.
      </p>
    </main>
  )
}

export default Login
