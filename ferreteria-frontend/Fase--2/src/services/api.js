import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  timeout: 10000,
})

export function mensajeDeError(error) {
  if (error.response?.data?.mensaje) return error.response.data.mensaje
  if (error.request) return 'No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.'
  return 'Ocurrió un error inesperado.'
}

export default api
