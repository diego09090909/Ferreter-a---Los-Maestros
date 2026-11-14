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

// los mismos campos que ProductoRequest de ms-catalogo; el codigo se guarda en mayusculas
function aProducto(datos, categorias) {
  const categoria = categorias.find((c) => c.id === Number(datos.categoriaId))
  return {
    codigo: datos.codigo.trim().toUpperCase(),
    nombre: datos.nombre.trim(),
    descripcion: datos.descripcion.trim(),
    subcategoria: datos.subcategoria.trim(),
    marca: datos.marca.trim(),
    unidad: datos.unidad.trim(),
    precioCompra: Number(datos.precioCompra),
    precio: Number(datos.precio),
    stock: Number(datos.stock),
    stockMinimo: Number(datos.stockMinimo),
    imagen: datos.imagen.trim() || null,
    categoriaId: Number(datos.categoriaId),
    categoria: categoria?.nombre ?? '',
  }
}

function validarProducto(producto, productos, id = null) {
  if (productos.some((p) => p.id !== id && (p.codigo ?? '').toUpperCase() === producto.codigo)) {
    throw new Error(`Ya existe un producto con el codigo ${producto.codigo}`)
  }
  if (producto.precio <= producto.precioCompra) {
    throw new Error('El precio de venta debe ser mayor al precio de compra')
  }
}

// API: POST /api/v1/productos
export async function crearProducto(datos, categorias) {
  const productos = obtenerProductos()
  const producto = aProducto(datos, categorias)
  validarProducto(producto, productos)

  const nuevo = { id: Math.max(0, ...productos.map((p) => p.id)) + 1, ...producto }
  guardarProductos([...productos, nuevo])
  return aRespuestaAdmin(nuevo)
}

// API: PUT /api/v1/productos/{id}
export async function actualizarProducto(id, datos, categorias) {
  const productos = obtenerProductos()
  const actual = productos.find((p) => p.id === id)
  if (!actual) throw new Error('No existe el producto')

  const producto = aProducto(datos, categorias)
  validarProducto(producto, productos, id)

  const actualizado = { ...actual, ...producto }
  guardarProductos(productos.map((p) => (p.id === id ? actualizado : p)))
  return aRespuestaAdmin(actualizado)
}
