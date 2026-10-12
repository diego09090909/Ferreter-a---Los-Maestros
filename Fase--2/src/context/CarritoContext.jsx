import { createContext, useContext, useEffect, useState } from 'react'
import { leer, guardar } from '../utils/storage'
import {
    agregarItem,
    cambiarCantidadItem,
    eliminarItem,
    calcularTotal,
    contarUnidades,
} from '../utils/carrito'

const CarritoContext = createContext(null)

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState(() => leer('carrito', []))

    useEffect(() => {
        guardar('carrito', carrito)
    }, [carrito])

    const valor = {
        carrito,
        total: calcularTotal(carrito),
        cantidadTotal: contarUnidades(carrito),
        agregar: (producto) => setCarrito((actual) => agregarItem(actual, producto)),
        cambiarCantidad: (codigo, cantidad) =>
            setCarrito((actual) => cambiarCantidadItem(actual, codigo, cantidad)),
        eliminar: (codigo) => setCarrito((actual) => eliminarItem(actual, codigo)),
        vaciar: () => setCarrito([]),
    }

    return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

export function useCarrito() {
    const contexto = useContext(CarritoContext)

    if (!contexto) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider')
    }

    return contexto
}