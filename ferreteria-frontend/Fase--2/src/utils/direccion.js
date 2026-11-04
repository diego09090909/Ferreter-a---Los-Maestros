import { REGIONES } from '../data/regiones'

export const CALLE_MINIMA = 5

export const DIRECCION_VACIA = {
    calle: '',
    departamento: '',
    region: '',
    comuna: '',
    indicaciones: '',
}

export function comunasDe(region) {
    const encontrada = REGIONES.find((r) => r.nombre === region)
    return encontrada ? encontrada.comunas : []
}


export function errorDireccion(direccion) {
    if (direccion.calle.trim().length < CALLE_MINIMA) {
        return `La calle y número deben tener al menos ${CALLE_MINIMA} caracteres`
    }
    if (!direccion.region) return 'Debe elegir una región'
    if (!direccion.comuna) return 'Debe elegir una comuna'
    if (!comunasDe(direccion.region).includes(direccion.comuna)) {
        return 'La comuna no pertenece a la región elegida'
    }
    return null
}


export function limpiarDireccion(direccion) {
    return {
        calle: direccion.calle.trim(),
        departamento: direccion.departamento.trim(),
        region: direccion.region,
        comuna: direccion.comuna,
        indicaciones: direccion.indicaciones.trim(),
    }
}


export function textoDireccion(direccion) {
    const partes = [direccion.calle, direccion.departamento, direccion.comuna, direccion.region]
    return partes.filter((parte) => parte && parte.trim() !== '').join(', ')
}