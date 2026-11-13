import { PRODUCTOS_INICIALES } from './productos'
import { leer, guardar } from '../utils/storage'

export const STOCK_MINIMO_POR_DEFECTO = 5

// un solo stock por producto, igual que ms-catalogo (stock + stockMinimo).
// Los productos guardados con stock de tienda y bodega por separado se juntan en uno.
function aStockUnico(producto) {
    if (producto.stock !== undefined) return producto
    const { stockTienda = 0, stockBodega = 0, ...resto } = producto
    return { ...resto, stock: stockTienda + stockBodega, stockMinimo: producto.stockMinimo ?? STOCK_MINIMO_POR_DEFECTO }
}

export function obtenerProductos() {
    const productos = leer('productos', PRODUCTOS_INICIALES).map(aStockUnico)
    guardar('productos', productos)
    return productos
}

export function guardarProductos(productos) {
    guardar('productos', productos)
}