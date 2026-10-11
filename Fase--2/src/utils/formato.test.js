import { formatearPrecio, sinTildes } from './formato'

describe('formato', () => {
    it('formatea un numero como precio chileno', () => {
        expect(formatearPrecio(49990)).toBe('$49.990')
    })

    it('quita tildes y pasa a minusculas', () => {
        expect(sinTildes('Eléctrico')).toBe('electrico')
    })
})