import { leer, guardar } from '../utils/storage'
import { formatearRut, limpiarRut } from '../utils/rut'
import { ROLES, etiquetaRol } from '../utils/roles'
import { borrarDireccionesDe } from './direcciones'

export const ADMIN_PREDEFINIDO = {
  rut: '11.111.111-1',
  nombre: 'Administrador General',
  email: 'admin@losmaestros.cl',
  password: 'admin123',
  rol: 'Administrador',
}

export function obtenerUsuarios() {
  return leer('usuarios', [])
}

export function guardarUsuarios(usuarios) {
  guardar('usuarios', usuarios)
}


export function inicializarAdminPorDefecto() {
  const usuarios = obtenerUsuarios()
  if (!usuarios.some((u) => u.rol === 'Administrador')) {
    guardarUsuarios([...usuarios, ADMIN_PREDEFINIDO])
  }
}

export async function crearUsuarioAdmin(datos) {
  const usuarios = obtenerUsuarios()
  const email = datos.email.trim().toLowerCase()

  if (usuarios.some((u) => (u.email ?? '').toLowerCase() === email)) {
    throw new Error('El email ya esta registrado')
  }
  if (usuarios.some((u) => limpiarRut(u.rut ?? '') === limpiarRut(datos.rut))) {
    throw new Error('El RUT ya esta registrado')
  }

  const nuevo = {
    rut: formatearRut(datos.rut),
    nombre: datos.nombre.trim(),
    email,
    password: datos.password,
    rol: etiquetaRol(datos.rol),
  }
  guardarUsuarios([...usuarios, nuevo])
  return nuevo
}

export async function actualizarUsuarioAdmin(rut, datos, rutAdmin) {
  const usuarios = obtenerUsuarios()
  const actual = usuarios.find((u) => u.rut === rut)
  if (!actual) throw new Error('Usuario no encontrado')

  const rol = etiquetaRol(datos.rol)
  if (rut === rutAdmin && rol !== actual.rol) {
    throw new Error('No puedes cambiar tu propio rol')
  }
  // el panel solo maneja roles de personal: un cliente sigue siendo cliente y el personal no pasa a cliente
  if (actual.rol === ROLES.CLIENTE && rol !== ROLES.CLIENTE) {
    throw new Error('Las cuentas de cliente no cambian de rol')
  }
  if (rol === ROLES.CLIENTE && actual.rol !== ROLES.CLIENTE) {
    throw new Error('Una cuenta de personal no se puede convertir en cliente')
  }

  const email = datos.email.trim().toLowerCase()
  if (usuarios.some((u) => u.rut !== rut && (u.email ?? '').toLowerCase() === email)) {
    throw new Error('El email ya esta registrado')
  }

  const editado = { ...actual, nombre: datos.nombre.trim(), email, rol }
  guardarUsuarios(usuarios.map((u) => (u.rut === rut ? editado : u)))
  return editado
}

export async function eliminarUsuarioAdmin(rut, rutAdmin) {
  if (rut === rutAdmin) throw new Error('No puedes eliminar tu propia cuenta')

  const usuarios = obtenerUsuarios()
  if (!usuarios.some((u) => u.rut === rut)) throw new Error('Usuario no encontrado')

  guardarUsuarios(usuarios.filter((u) => u.rut !== rut))
  borrarDireccionesDe(rut)
}
