import axios from 'axios'
import { leer, guardar, borrar } from '../utils/storage'
import { etiquetaRol } from '../utils/roles'

export const URL_USUARIOS = import.meta.env.VITE_API_USUARIOS ?? 'http://localhost:8081/api/v1'

const CLAVE_SESION = 'usuarioActivo'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 10000,
})

export const leerSesion = () => leer(CLAVE_SESION, null)
export const guardarSesion = (sesion) => guardar(CLAVE_SESION, sesion)
export const borrarSesion = () => borrar(CLAVE_SESION)

export const usuarioDeSesion = (sesion) => {
  const usuario = { ...sesion }
  delete usuario.token
  delete usuario.refreshToken
  return usuario
}

export const aUsuarioFront = (usuario) => ({ ...usuario, rol: etiquetaRol(usuario.rol) })

export const sesionDesdeRespuesta = (datos) => ({
  ...aUsuarioFront(datos.usuario),
  token: datos.token,
  refreshToken: datos.refreshToken,
})

let alExpirar = () => {}
export const alExpirarSesion = (funcion) => {
  alExpirar = funcion
}

api.interceptors.request.use((config) => {
  const token = leerSesion()?.token
  if (token && !config.publica) config.headers.Authorization = `Bearer ${token}`
  return config
})

let renovando = null

function renovar() {
  if (!renovando) {
    renovando = api
      .post(`${URL_USUARIOS}/auth/refresh`, { refreshToken: leerSesion()?.refreshToken }, { publica: true })
      .then(({ data }) => {
        const nueva = sesionDesdeRespuesta(data)
        guardarSesion(nueva)
        return nueva.token
      })
      .finally(() => {
        renovando = null
      })
  }
  return renovando
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config
    const puedeRenovar =
      error.response?.status === 401 &&
      original &&
      !original.publica &&
      !original.reintento &&
      leerSesion()?.refreshToken

    if (!puedeRenovar) return Promise.reject(error)

    original.reintento = true
    try {
      const token = await renovar()
      original.headers.Authorization = `Bearer ${token}`
      return api(original)
    } catch (fallo) {
      if ([400, 401].includes(fallo.response?.status)) {
        borrarSesion()
        alExpirar()
      }
      return Promise.reject(fallo)
    }
  },
)

export function mensajeDeError(error) {
  const errores = error.response?.data?.errores
  if (errores) return Object.values(errores).join('. ')
  if (error.response?.data?.mensaje) return error.response.data.mensaje
  if (error.response?.status === 401) return 'Tu sesión expiró o no has iniciado sesión. Vuelve a ingresar.'
  if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
  if (error.request) return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.'
  return 'Ocurrió un error inesperado.'
}

export default api