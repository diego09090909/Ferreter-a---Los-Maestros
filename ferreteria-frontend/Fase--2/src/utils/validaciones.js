import { rutEsValido } from './rut'

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

export function hayErrores(errores) {
  return Object.keys(errores).length > 0
}

function errorNombre(nombre) {
  const limpio = nombre.trim()
  if (limpio === '') return 'Ingresa tu nombre'
  if (limpio.length < NOMBRE_MINIMO) return `El nombre debe tener al menos ${NOMBRE_MINIMO} caracteres`
  return null
}

function errorCorreo(correo) {
  if (correo.trim() === '') return 'Ingresa tu correo'
  if (!correoValido(correo)) return 'El correo no tiene un formato válido'
  return null
}

function errorPassword(password, vacia = 'Ingresa una contraseña') {
  if (password === '') return vacia
  if (!passwordValida(password)) return `La contraseña debe tener entre ${PASSWORD_MINIMA} y ${PASSWORD_MAXIMA} caracteres`
  return null
}


function armar(campos) {
  return Object.fromEntries(Object.entries(campos).filter(([, mensaje]) => mensaje))
}

export function erroresIngreso({ usuario, password }) {
  return armar({
    usuario: usuario.trim() === '' ? 'Ingresa tu RUT o correo' : null,
    password: password === '' ? 'Ingresa tu contraseña' : null,
  })
}

export function erroresRegistro({ nombre, rut, email, password }) {
  let errorRut = null
  if (rut.trim() === '') errorRut = 'Ingresa tu RUT'
  else if (!rutEsValido(rut)) errorRut = 'El RUT no es válido, revisa el dígito verificador'

  return armar({
    nombre: errorNombre(nombre),
    rut: errorRut,
    email: errorCorreo(email),
    password: errorPassword(password),
  })
}

export function erroresDatos({ nombre, email }) {
  return armar({
    nombre: errorNombre(nombre),
    email: errorCorreo(email),
  })
}

export function erroresClaves({ actual, nueva, repetir }) {
  let errorNueva = errorPassword(nueva, 'Ingresa la nueva contraseña')
  if (!errorNueva && nueva === actual) errorNueva = 'La nueva contraseña debe ser distinta a la actual'

  let errorRepetir = null
  if (repetir === '') errorRepetir = 'Repite la nueva contraseña'
  else if (repetir !== nueva) errorRepetir = 'Las contraseñas nuevas no coinciden'

  return armar({
    actual: actual === '' ? 'Ingresa tu contraseña actual' : null,
    nueva: errorNueva,
    repetir: errorRepetir,
  })
}

export function claseCampo(base, error) {
  return error ? `${base} is-invalid` : base
}

export function enfocarPrimerError(formulario) {
  setTimeout(() => formulario?.querySelector('.is-invalid')?.focus(), 0)
}
