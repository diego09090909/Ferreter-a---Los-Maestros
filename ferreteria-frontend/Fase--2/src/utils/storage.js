
export function leer(clave, porDefecto = null) {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado === null ? porDefecto : JSON.parse(guardado)
  } catch {
    return porDefecto
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
  
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(clave)
  } catch {

  }
}
