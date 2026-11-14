import axios from 'axios'
import { leer } from '../utils/storage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = leer('usuarioActivo')?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function mensajeDeError(error) {
  if (error.response?.data?.mensaje) return error.response.data.mensaje
  if (error.response?.status === 401) return 'Tu sesión expiró o no has iniciado sesión. Vuelve a ingresar.'
  if (error.response?.status === 403) return 'No tienes permiso para realizar esta acción.'
  if (error.request) return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.'
  return 'Ocurrió un error inesperado.'
}

export default api
