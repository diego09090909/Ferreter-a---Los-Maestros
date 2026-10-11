export const CANTIDAD_MINIMA = 1
export const CANTIDAD_MAXIMA = 10

export const OPCIONES_ENTREGA = ['Retiro en tienda', 'Despacho a domicilio']
export const OPCIONES_PAGO = ['Crédito', 'Cuenta Corriente']

// El carrito guarda cada item con codigo "producto-" + id
export function codigoDe(producto) {
    return 'producto-' + producto.id
}

export function idProductoDe(codigo) {
    return Number(codigo.replace('producto-', ''))
}

// Agrega un producto, o le suma una unidad si ya estaba en el carrito
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
            imagen: producto.imagen,
            stock: 'disponible',
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

// Arma lo que deja una compra: stock descontado, pedido y venta para el panel de administracion.
// No toca localStorage: quien la llama decide que guardar.
export function registrarCompra({ carrito, productos, usuario, entrega, pago, ahora = new Date() }) {
    let categoria = ''

    const productosActualizados = productos.map((producto) => {
        const item = carrito.find((i) => idProductoDe(i.codigo) === producto.id)

        if (!item) {
            return producto
        }

        categoria = categoria === '' || categoria === producto.categoria ? producto.categoria : 'Varios'

        // primero se descuenta de la tienda y lo que falte sale de la bodega
        const desdeTienda = Math.min(producto.stockTienda, item.cantidad)
        const restante = item.cantidad - desdeTienda

        return {
            ...producto,
            stockTienda: producto.stockTienda - desdeTienda,
            stockBodega: Math.max(0, producto.stockBodega - restante),
        }
    })

    const total = calcularTotal(carrito)
    const id = String(ahora.getTime()).slice(-4)

    return {
        productos: productosActualizados,
        pedido: {
            id,
            cliente: usuario ? usuario.nombre : 'Cliente Anónimo',
            tipoPago: pago,
            tipoEntrega: entrega,
            total,
            estado: 'Pendiente',
        },
        venta: {
            id,
            fecha: ahora.toLocaleDateString('es-CL'),
            categoria: categoria === '' ? 'General' : categoria,
            monto: total,
            medioPago: pago,
        },
    }
}