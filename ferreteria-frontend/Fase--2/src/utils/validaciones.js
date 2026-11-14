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

// formulario "Nuevo usuario" del panel admin: los mismos datos del registro + el rol.
// Como el admin crea la cuenta de otra persona, "Ingresa tu RUT" pasa a "Ingresa el RUT".
export function erroresNuevoUsuario(datos) {
  const errores = Object.fromEntries(
    Object.entries(erroresRegistro(datos)).map(([campo, mensaje]) => [campo, mensaje.replace('Ingresa tu ', 'Ingresa el ')]),
  )
  if (!datos.rol) errores.rol = 'Elige un rol'
  return errores
}

// formulario "Editar usuario" del panel admin: { nombre, email, rol }
export function erroresEditarUsuario(datos) {
  const errores = Object.fromEntries(
    Object.entries(erroresDatos(datos)).map(([campo, mensaje]) => [campo, mensaje.replace('Ingresa tu ', 'Ingresa el ')]),
  )
  if (!datos.rol) errores.rol = 'Elige un rol'
  return errores
}

export const STOCK_MAXIMO_MOVIMIENTO = 9999

// formulario de inventario: 'reponer' suma unidades (minimo 1) y 'ajustar' corrige al stock contado (0 o mas)
export function erroresMovimientoStock({ cantidad }, modo, stockActual) {
  const texto = String(cantidad).trim()
  const numero = Number(texto)
  if (texto === '') return { cantidad: modo === 'reponer' ? 'Ingresa la cantidad a reponer' : 'Ingresa el stock contado' }
  if (!Number.isInteger(numero)) return { cantidad: 'Ingresa un número entero' }
  if (modo === 'reponer' && numero < 1) return { cantidad: 'La cantidad debe ser al menos 1' }
  if (modo === 'ajustar' && numero < 0) return { cantidad: 'El stock no puede ser negativo' }
  if (numero > STOCK_MAXIMO_MOVIMIENTO) return { cantidad: `El máximo es ${STOCK_MAXIMO_MOVIMIENTO}` }
  if (modo === 'ajustar' && numero === stockActual) return { cantidad: 'El stock contado es igual al actual' }
  return {}
}

const PATRON_CODIGO = /^[A-Z]{2}\d{3}$/

function errorEntero(valor, minimo, vacio, menor) {
  const texto = String(valor).trim()
  if (texto === '') return vacio
  if (!Number.isInteger(Number(texto))) return 'Ingresa un número entero'
  if (Number(texto) < minimo) return menor
  return null
}

// formulario de producto del panel: mismas reglas que ProductoRequest de ms-catalogo
export function erroresProducto(datos) {
  const largo = (campo, maximo, nombre) =>
    datos[campo].trim().length > maximo ? `${nombre} no puede tener más de ${maximo} caracteres` : null
  const codigo = datos.codigo.trim().toUpperCase()

  const errores = {
    codigo: codigo === '' ? 'Ingresa el código' : !PATRON_CODIGO.test(codigo) ? 'Usa 2 letras y 3 números (ej: MC001)' : null,
    nombre: datos.nombre.trim() === '' ? 'Ingresa el nombre' : largo('nombre', 100, 'El nombre'),
    descripcion: largo('descripcion', 500, 'La descripción'),
    categoriaId: datos.categoriaId === '' ? 'Elige una categoría' : null,
    subcategoria: datos.subcategoria.trim() === '' ? 'Ingresa la subcategoría' : largo('subcategoria', 50, 'La subcategoría'),
    marca: largo('marca', 50, 'La marca'),
    unidad: datos.unidad.trim() === '' ? 'Ingresa la unidad (ej: Unidad, Saco, Galón)' : largo('unidad', 30, 'La unidad'),
    precioCompra: errorEntero(datos.precioCompra, 1, 'Ingresa el precio de compra', 'El precio de compra debe ser mayor a 0'),
    precio: errorEntero(datos.precio, 1, 'Ingresa el precio de venta', 'El precio de venta debe ser mayor a 0'),
    stock: errorEntero(datos.stock, 0, 'Ingresa el stock', 'El stock no puede ser negativo'),
    stockMinimo: errorEntero(datos.stockMinimo, 0, 'Ingresa el stock mínimo', 'El stock mínimo no puede ser negativo'),
  }
  if (!errores.precio && !errores.precioCompra && Number(datos.precio) <= Number(datos.precioCompra)) {
    errores.precio = 'El precio de venta debe ser mayor al de compra'
  }
  return armar(errores)
}
