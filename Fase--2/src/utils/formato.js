
export function formatearPrecio(valor) {
  return '$' + Number(valor).toLocaleString('es-CL')
}


export function sinTildes(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
