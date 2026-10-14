export const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

export const NOMBRE_MINIMO = 3
export const PASSWORD_MINIMA = 6
export const PASSWORD_MAXIMA = 18

export function nombreValido(nombre) {
  return nombre.trim().length >= NOMBRE_MINIMO
}

export function correoValido(correo) {
  return PATRON_CORREO.test(correo.trim())
}

export function passwordValida(password) {
  return password.length >= PASSWORD_MINIMA && password.length <= PASSWORD_MAXIMA
}
