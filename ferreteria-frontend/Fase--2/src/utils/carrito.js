import { imagenDe } from './imagen'

export const CANTIDAD_MINIMA = 1
export const CANTIDAD_MAXIMA = 10

export const OPCIONES_ENTREGA = ['Retiro en tienda', 'Despacho a domicilio']
export const ENTREGA_DOMICILIO = 'Despacho a domicilio'
export const OPCIONES_PAGO = ['Débito', 'Crédito', 'Cuenta Corriente']

export function codigoDe(producto) {
    return 'producto-' + producto.id
}

export function idProductoDe(codigo) {
    return Number(codigo.replace('producto-', ''))
}


export function agregarItem(carrito, producto) {
    const codigo = codigoDe(producto)
    const yaEsta = carrito.some((item) => item.codigo === codigo)

    if (yaEsta) {
        return carrito.map((item) =>
            item.codigo === codigo ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
    }

    return [
        ...carrito,
        {
            codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: imagenDe(producto),
            cantidad: 1,
        },
    ]
}

export function cambiarCantidadItem(carrito, codigo, cantidad) {
    return carrito.map((item) => (item.codigo === codigo ? { ...item, cantidad } : item))
}

export function eliminarItem(carrito, codigo) {
    return carrito.filter((item) => item.codigo !== codigo)
}

export function calcularTotal(carrito) {
    return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0)
}

export function contarUnidades(carrito) {
    return carrito.reduce((suma, item) => suma + item.cantidad, 0)
}

export function cantidadValida(cantidad) {
    return Number.isInteger(cantidad) && cantidad >= CANTIDAD_MINIMA && cantidad <= CANTIDAD_MAXIMA
}

export function hayCantidadInvalida(carrito) {
    return carrito.some((item) => !cantidadValida(item.cantidad))
}
