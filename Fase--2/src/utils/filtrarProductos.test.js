import { describe, it, expect } from 'vitest'
import { filtrarProductos, FILTROS_INICIALES, PRECIO_MAXIMO } from './filtrarProductos'

const productosMock = [
    { id: 1, nombre: 'Taladro Percutor 710W', descripcion: 'Taladro de alta potencia', precio: 49990, categoria: 'Herramientas', marca: 'Bauker' },
    { id: 2, nombre: 'Cemento Bío Bío 25kg', descripcion: 'Saco de cemento', precio: 7800, categoria: 'Construccion', marca: 'Cintac' },
    { id: 3, nombre: 'Esmalte al Agua 1 Galón', descripcion: 'Pintura lavable', precio: 24990, categoria: 'Pinturas', marca: 'Kolor' },
    { id: 4, nombre: 'Sierra Circular 1400W', descripcion: 'Sierra profesional', precio: 65990, categoria: 'Herramientas', marca: 'DeWalt' }
]

describe('Pruebas unitarias de filtrarProductos', () => {

    it('debe filtrar correctamente por categoría', () => {
        const filtros = { ...FILTROS_INICIALES, categorias: ['Herramientas'] }
        const resultado = filtrarProductos(productosMock, filtros)

        expect(resultado).toHaveLength(2)
    })

    it('debe filtrar productos menores o iguales al precio máximo', () => {
        const filtros = { ...FILTROS_INICIALES, precioMaximo: 30000 }
        const resultado = filtrarProductos(productosMock, filtros)

        expect(resultado).toHaveLength(2)
    })

    it('debe devolver todos los productos si los filtros están por defecto', () => {
        const resultado = filtrarProductos(productosMock, FILTROS_INICIALES, '')

        expect(resultado).toHaveLength(4)
    })
})