import { PRODUCTOS_INICIALES } from './productos'
import { leer, guardar } from '../utils/storage'

// Devuelve los productos guardados; la primera vez los carga desde productos.js.
export function obtenerProductos() {
    const guardados = leer('productos', null)

    if (guardados === null) {
        guardar('productos', PRODUCTOS_INICIALES)
        return PRODUCTOS_INICIALES
    }

    return guardados
}