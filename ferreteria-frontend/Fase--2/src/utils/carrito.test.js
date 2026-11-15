import { describe, it, expect } from 'vitest'
import {
    agregarItem,
    calcularTotal,
    cantidadValida,
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
