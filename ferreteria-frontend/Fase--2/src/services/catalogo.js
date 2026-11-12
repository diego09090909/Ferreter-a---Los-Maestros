import api from './api'

// GET /api/v1/productos -> lista publica (sin precio de compra)
export async function obtenerProductos() {
  const { data } = await api.get('/api/v1/productos')
  return data
}

// GET /api/v1/productos/{id}
export async function obtenerProducto(id) {
  const { data } = await api.get(`/api/v1/productos/${id}`)
  return data
}

// GET /api/v1/categorias
export async function obtenerCategorias() {
  const { data } = await api.get('/api/v1/categorias')
  return data
}
