


export function limpiarRut(rut) {
  return String(rut).replace(/\./g, '').replace(/-/g, '').toUpperCase()
}


export function pareceRut(texto) {
  return /^[0-9.-]*[kK]?$/.test(texto)
}


export function formatearMientrasEscribe(valor) {
  let limpio = String(valor).replace(/[^0-9kK]/g, '').toUpperCase()
  if (limpio.length > 9) limpio = limpio.slice(0, 9)

 
  if (limpio.length < 8) return limpio

  return limpio.slice(0, -1) + '-' + limpio.slice(-1)
}


export function rutEsValido(rut) {
  const limpio = limpiarRut(rut)
  if (limpio.length < 8) return false

  const cuerpo = limpio.slice(0, -1)
  const digitoVerificador = limpio.slice(-1)
  if (isNaN(Number(cuerpo))) return false

  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo.charAt(i)) * multiplicador
    multiplicador++
    if (multiplicador > 7) multiplicador = 2
  }

  const resto = 11 - (suma % 11)
  let esperado = String(resto)
  if (resto === 11) esperado = '0'
  if (resto === 10) esperado = 'K'

  return esperado === digitoVerificador
}

// deja el rut con puntos y guion: 12.345.678-5
export function formatearRut(rut) {
  const limpio = limpiarRut(rut)
  const cuerpo = limpio.slice(0, -1)
  const digitoVerificador = limpio.slice(-1)

  let conPuntos = ''
  let contador = 0
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    conPuntos = cuerpo.charAt(i) + conPuntos
    contador++
    if (contador === 3 && i !== 0) {
      conPuntos = '.' + conPuntos
      contador = 0
    }
  }

  return conPuntos + '-' + digitoVerificador
}
