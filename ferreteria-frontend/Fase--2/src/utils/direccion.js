import { REGION_DESPACHO } from '../data/despacho'
import { tieneCobertura } from './despacho'

export const CALLE_MINIMA = 3

export const DIRECCION_VACIA = {
    calle: '',
    numero: '',
    departamento: '',
    region: REGION_DESPACHO,
    comuna: '',
    indicaciones: '',
}

export function completarDireccion(direccion) {
    return { ...DIRECCION_VACIA, ...direccion, region: REGION_DESPACHO }
}

export function erroresDireccion(direccion) {
    const errores = {}
    const calle = direccion.calle.trim()

    if (calle === '') errores.calle = 'Ingresa la calle'
    else if (calle.length < CALLE_MINIMA) errores.calle = `La calle debe tener al menos ${CALLE_MINIMA} caracteres`

    if (direccion.numero.trim() === '') errores.numero = 'Ingresa el número'

    if (!direccion.comuna) errores.comuna = 'Elige una comuna'
    else if (!tieneCobertura(direccion.comuna)) errores.comuna = 'No tenemos despacho a esa comuna'

    return errores
}

export function errorDireccion(direccion) {
    return Object.values(erroresDireccion(direccion))[0] ?? null
}

export function limpiarDireccion(direccion) {
    return {
        calle: direccion.calle.trim(),
        numero: direccion.numero.trim(),
        departamento: direccion.departamento.trim(),
        region: REGION_DESPACHO,
        comuna: direccion.comuna,
        indicaciones: direccion.indicaciones.trim(),
    }
}

export function textoDireccion(direccion) {
    const calleNumero = [direccion.calle, direccion.numero].filter(Boolean).join(' ')
    const partes = [calleNumero, direccion.departamento, direccion.comuna, direccion.region]
    return partes.filter((parte) => parte && parte.trim() !== '').join(', ')
}
