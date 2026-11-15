import api, { mensajeDeError } from './api'

async function llamar(peticion) {
  try {
    const { data } = await peticion
    return data
  } catch (error) {
    throw new Error(mensajeDeError(error))
  }
}

export function listarInventario() {
  return llamar(api.get('/api/v1/productos/admin'))
}

async function moverStock(id, accion, cantidad) {
  await llamar(api.put(`/api/v1/productos/${id}/${accion}`, { cantidad }))
  return llamar(api.get(`/api/v1/productos/admin/${id}`))
}

export function reponerStock(id, cantidad) {
  return moverStock(id, 'reponer-stock', cantidad)
}

export function descontarStock(id, cantidad) {
  return moverStock(id, 'descontar-stock', cantidad)
}

export async function ajustarStock(producto, stockContado) {
  const diferencia = stockContado - producto.stock
  if (diferencia > 0) return reponerStock(producto.id, diferencia)
  return descontarStock(producto.id, -diferencia)
}

function aProductoRequest(datos) {
  return {
    codigo: datos.codigo.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim() || null,
    subcategoria: datos.subcategoria.trim(),
    marca: datos.marca.trim() || null,
    unidad: datos.unidad.trim(),
    precioCompra: Number(datos.precioCompra),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    stockMinimo: Number(datos.stockMinimo),
    imagen: datos.imagen.trim() || null,
    categoriaId: Number(datos.categoriaId),
  }
}

export function crearProducto(datos) {
  return llamar(api.post('/api/v1/productos', aProductoRequest(datos)))
}

export function actualizarProducto(id, datos) {
  return llamar(api.put(`/api/v1/productos/${id}`, aProductoRequest(datos)))
}
