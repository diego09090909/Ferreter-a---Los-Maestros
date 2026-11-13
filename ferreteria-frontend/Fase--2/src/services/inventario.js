import { guardarProductos, obtenerProductos } from '../data/almacen'

// devuelve cada producto con la misma forma que ProductoAdminResponse de ms-catalogo
function aRespuestaAdmin(p) {
  return {
    ...p,
    margen: p.precioCompra != null ? p.precio - p.precioCompra : null,
    stockBajo: p.stock <= p.stockMinimo,
  }
}

function cambiarStock(id, calcular) {
  const productos = obtenerProductos()
  const producto = productos.find((p) => p.id === id)
  if (!producto) throw new Error('No existe el producto')

  const actualizado = { ...producto, stock: calcular(producto) }
  guardarProductos(productos.map((p) => (p.id === id ? actualizado : p)))
  return aRespuestaAdmin(actualizado)
}

// API: GET /api/v1/productos/admin
export async function listarInventario() {
  return obtenerProductos().map(aRespuestaAdmin)
}

// API: PUT /api/v1/productos/{id}/reponer-stock con { cantidad }
export async function reponerStock(id, cantidad) {
  return cambiarStock(id, (p) => p.stock + cantidad)
}

// API: PUT /api/v1/productos/{id}/descontar-stock con { cantidad }
export async function descontarStock(id, cantidad) {
  return cambiarStock(id, (p) => {
    if (cantidad > p.stock) {
      throw new Error(`Stock insuficiente para ${p.nombre}: se pidieron ${cantidad} y hay ${p.stock}`)
    }
    return p.stock - cantidad
  })
}

// ajuste por conteo fisico: deja el stock en el valor contado usando reponer o descontar la diferencia
export async function ajustarStock(producto, stockContado) {
  const diferencia = stockContado - producto.stock
  if (diferencia > 0) return reponerStock(producto.id, diferencia)
  return descontarStock(producto.id, -diferencia)
}
