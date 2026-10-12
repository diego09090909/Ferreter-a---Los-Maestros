import { describe, it, expect } from 'vitest'
import {
    agregarItem,
    calcularTotal,
    cantidadValida,
    registrarCompra,
} from './carrito'

const martillo = { id: 1, nombre: 'Martillo', precio: 5000, imagen: 'martillo.jpg' }

describe('carrito', () => {
    it('agrega un producto nuevo con cantidad 1', () => {
        const carrito = agregarItem([], martillo)

        expect(carrito).toHaveLength(1)
        expect(carrito[0].codigo).toBe('producto-1')
        expect(carrito[0].cantidad).toBe(1)
    })

    it('suma una unidad si el producto ya estaba', () => {
        const carrito = agregarItem(agregarItem([], martillo), martillo)

        expect(carrito).toHaveLength(1)
        expect(carrito[0].cantidad).toBe(2)
    })

    it('calcula el total', () => {
        const carrito = [{ codigo: 'producto-1', precio: 5000, cantidad: 3 }]

        expect(calcularTotal(carrito)).toBe(15000)
    })

    it('acepta cantidades de 1 a 10 y rechaza el resto', () => {
        expect(cantidadValida(1)).toBe(true)
        expect(cantidadValida(10)).toBe(true)
        expect(cantidadValida(0)).toBe(false)
        expect(cantidadValida(11)).toBe(false)
        expect(cantidadValida(2.5)).toBe(false)
    })
})

describe('registrarCompra', () => {
    it('descuenta primero de la tienda y luego de la bodega', () => {
        const productos = [
            { id: 1, nombre: 'Martillo', categoria: 'Herramientas', stockTienda: 3, stockBodega: 10 },
        ]
        const carrito = [{ codigo: 'producto-1', precio: 5000, cantidad: 5 }]

        const resultado = registrarCompra({
            carrito,
            productos,
            usuario: { nombre: 'Kevin' },
            entrega: 'Retiro en tienda',
            pago: 'Cuenta Corriente',
        })

        expect(resultado.productos[0].stockTienda).toBe(0)
        expect(resultado.productos[0].stockBodega).toBe(8)
        expect(resultado.pedido.total).toBe(25000)
        expect(resultado.pedido.cliente).toBe('Kevin')
        expect(resultado.pedido.estado).toBe('Pendiente')
        expect(resultado.venta.categoria).toBe('Herramientas')
    })
})