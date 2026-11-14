import { describe, it, expect } from 'vitest'
import { armarVentaRequest } from './ventas'

const CARRITO = [
  { codigo: 'producto-1', nombre: 'Taladro', precio: 49990, cantidad: 2 },
  { codigo: 'producto-4', nombre: 'Cemento', precio: 5990, cantidad: 3 },
]

const DIRECCION = {
  calle: 'Av. Francisco de Aguirre',
  numero: '123',
  departamento: 'Depto 4',
  comuna: 'La Serena',
  region: 'Coquimbo',
}

describe('armarVentaRequest', () => {
  it('convierte el carrito en items con el id del producto y la cantidad (sin precios)', () => {
    const venta = armarVentaRequest({ carrito: CARRITO, entrega: 'Retiro en tienda' })

    expect(venta.items).toEqual([
      { productoId: 1, cantidad: 2 },
      { productoId: 4, cantidad: 3 },
    ])
  })

  it('retiro en tienda: no envía dirección ni comuna', () => {
    const venta = armarVentaRequest({ carrito: CARRITO, entrega: 'Retiro en tienda', direccion: DIRECCION })

    expect(venta.tipoEntrega).toBe('RETIRO_EN_TIENDA')
    expect(venta).not.toHaveProperty('direccionDespacho')
    expect(venta).not.toHaveProperty('comunaDespacho')
  })

  it('despacho a domicilio: envía la dirección como texto y la comuna por separado', () => {
    const venta = armarVentaRequest({ carrito: CARRITO, entrega: 'Despacho a domicilio', direccion: DIRECCION })

    expect(venta.tipoEntrega).toBe('DESPACHO_A_DOMICILIO')
    expect(venta.direccionDespacho).toBe('Av. Francisco de Aguirre 123, Depto 4, La Serena, Coquimbo')
    expect(venta.comunaDespacho).toBe('La Serena')
  })
})
