import { COMUNAS_DESPACHO_GRATIS, MONTO_DESPACHO_GRATIS, ZONAS_DESPACHO } from '../data/despacho'

export function zonaDe(comuna) {
    return ZONAS_DESPACHO.find((zona) => zona.comuna === comuna) ?? null
}

export function tieneCobertura(comuna) {
    const zona = zonaDe(comuna)
    return zona !== null && zona.costo !== null
}

export function comunasConCobertura() {
    return ZONAS_DESPACHO.filter((zona) => zona.costo !== null).map((zona) => zona.comuna)
}

export function aplicaDespachoGratis(comuna, subtotal) {
    return COMUNAS_DESPACHO_GRATIS.includes(comuna) && subtotal >= MONTO_DESPACHO_GRATIS
}

export function costoDespacho(comuna, subtotal) {
    if (!tieneCobertura(comuna)) return null
    if (aplicaDespachoGratis(comuna, subtotal)) return 0
    return zonaDe(comuna).costo
}


export function faltaParaDespachoGratis(comuna, subtotal) {
    if (!COMUNAS_DESPACHO_GRATIS.includes(comuna)) return 0
    return Math.max(0, MONTO_DESPACHO_GRATIS - subtotal)
}


export function colorEstado(zona) {
    if (zona.costo === null) return 'secondary'
    if (zona.estado === 'Días acordados') return 'warning'
    return 'success'
}
