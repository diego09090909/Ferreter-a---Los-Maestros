import { describe, it, expect } from 'vitest'
import { comunasConCobertura, costoDespacho, faltaParaDespachoGratis } from './despacho'
import { errorDireccion, textoDireccion, DIRECCION_VACIA } from './direccion'

describe('despacho', () => {
    it('solo permite elegir comunas con cobertura', () => {
        expect(comunasConCobertura()).toContain('La Serena')
        expect(comunasConCobertura()).not.toContain('La Higuera')
    })

    it('cobra el costo de la comuna', () => {
        expect(costoDespacho('Ovalle', 20000)).toBe(11990)
    })

    it('es gratis en La Serena sobre $50.000 pero no en otras comunas', () => {
        expect(costoDespacho('La Serena', 50000)).toBe(0)
        expect(costoDespacho('Vicuña', 80000)).toBe(8990)
    })

    it('devuelve null si la comuna no tiene cobertura', () => {
        expect(costoDespacho('La Higuera', 10000)).toBeNull()
    })

    it('calcula cuanto falta para el despacho gratis', () => {
        expect(faltaParaDespachoGratis('Coquimbo', 30000)).toBe(20000)
        expect(faltaParaDespachoGratis('Ovalle', 30000)).toBe(0)
    })
})

describe('direccion', () => {
    const valida = { ...DIRECCION_VACIA, calle: 'Av. Francisco de Aguirre', numero: '1450', comuna: 'La Serena' }

    it('acepta una direccion completa', () => {
        expect(errorDireccion(valida)).toBeNull()
    })

    it('exige el numero por separado', () => {
        expect(errorDireccion({ ...valida, numero: '' })).toMatch(/número/)
    })

    it('no deja escribir el numero dentro de la calle', () => {
        expect(errorDireccion({ ...valida, calle: 'jackson 867' })).toMatch(/número va en su propio campo/)
        expect(errorDireccion({ ...valida, calle: 'Avenida 4 Esquinas' })).toBeNull()
    })

    it('el numero acepta digitos, una letra o S/N', () => {
        expect(errorDireccion({ ...valida, numero: '1450B' })).toBeNull()
        expect(errorDireccion({ ...valida, numero: 'S/N' })).toBeNull()
        expect(errorDireccion({ ...valida, numero: 'jackson 867' })).toMatch(/solo el número/)
    })

    it('rechaza comunas sin cobertura', () => {
        expect(errorDireccion({ ...valida, comuna: 'Maipú' })).toMatch(/despacho/)
    })

    it('arma el texto con calle y numero juntos', () => {
        expect(textoDireccion(valida)).toBe('Av. Francisco de Aguirre 1450, La Serena, Región de Coquimbo')
    })
})
