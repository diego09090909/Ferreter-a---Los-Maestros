import { PRODUCTOS_INICIALES } from './productos'

// Lee un valor guardado en localStorage. Si no existe o falla, devuelve el valor por defecto.
export function leer(clave, porDefecto) {
    try {
        const guardado = localStorage.getItem(clave)
        return guardado === null ? porDefecto : JSON.parse(guardado)
    } catch {
        return porDefecto
    }
}

// Guarda un valor en localStorage como texto JSON.
export function guardar(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
        
    }
}

// Devuelve los productos guardados; la primera vez los carga desde productos.js.
export function obtenerProductos() {
    const guardados = leer('productos', null)

    if (guardados === null) {
        guardar('productos', PRODUCTOS_INICIALES)
        return PRODUCTOS_INICIALES
    }

    return guardados
}