import { createContext, useContext, useEffect, useRef, useState } from 'react'
import api, {
  URL_USUARIOS,
  alExpirarSesion,
  aUsuarioFront,
  borrarSesion,
  guardarSesion,
  leerSesion,
  sesionDesdeRespuesta,
  usuarioDeSesion,
} from '../services/api'
import { ROLES } from '../utils/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const sesion = leerSesion()
    return sesion ? usuarioDeSesion(sesion) : null
  })

  const saliendoRef = useRef(false)

  useEffect(() => {
    alExpirarSesion(() => setUsuario(null))

    if (!leerSesion()) return
    api
      .get(`${URL_USUARIOS}/usuarios/me`)
      .then(({ data }) => {
        const sesion = leerSesion()
        if (!sesion) return
        const actualizada = { ...sesion, ...aUsuarioFront(data) }
        guardarSesion(actualizada)
        setUsuario(usuarioDeSesion(actualizada))
      })
      .catch(() => {})
  }, [])

  const abrirSesion = (datos) => {
    const sesion = sesionDesdeRespuesta(datos)
    saliendoRef.current = false
    guardarSesion(sesion)
    const logueado = usuarioDeSesion(sesion)
    setUsuario(logueado)
    return logueado
  }

  const ingresar = async (identificador, password) => {
    const { data } = await api.post(
      `${URL_USUARIOS}/auth/login`,
      { usuario: identificador, password },
      { publica: true },
    )
    return abrirSesion(data)
  }

  const registrar = async (cuerpo) => {
    const { data } = await api.post(`${URL_USUARIOS}/auth/registro`, cuerpo, { publica: true })
    return abrirSesion(data)
  }

  const cerrarSesion = () => {
    saliendoRef.current = true
    borrarSesion()
    setUsuario(null)
  }

  const actualizarUsuario = (cambios) => {
    const nuevo = { ...usuario, ...cambios }
    const sesion = leerSesion()
    if (sesion) guardarSesion({ ...sesion, ...cambios })
    setUsuario(nuevo)
  }

  const esAdmin = usuario?.rol === ROLES.ADMIN
  const esVendedor = usuario?.rol === ROLES.VENDEDOR
  const esCliente = usuario?.rol === ROLES.CLIENTE

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin,
        esVendedor,
        esCliente,
        ingresar,
        registrar,
        cerrarSesion,
        actualizarUsuario,
        saliendoRef,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}