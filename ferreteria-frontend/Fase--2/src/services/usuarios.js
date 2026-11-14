import api, { URL_USUARIOS, aUsuarioFront, mensajeDeError } from './api'
import { valorRol } from '../utils/roles'

const BASE = `${URL_USUARIOS}/admin/usuarios`


const RUT_ADMIN_GENERAL = '11111111-1'

const rutSinPuntos = (rut) => String(rut ?? '').replace(/\./g, '').toUpperCase()

export function esCuentaPrincipal(usuario) {
  return rutSinPuntos(usuario?.rut) === RUT_ADMIN_GENERAL
}

async function llamar(peticion) {
  try {
    const { data } = await peticion
    return data
  } catch (error) {
    throw new Error(mensajeDeError(error))
  }
}

export async function obtenerUsuarios() {
  const lista = await llamar(api.get(BASE))
  return lista.map(aUsuarioFront)
}

export async function crearUsuarioAdmin(datos) {
  const creado = await llamar(
    api.post(BASE, {
      nombre: datos.nombre.trim(),
      rut: rutSinPuntos(datos.rut),
      email: datos.email.trim().toLowerCase(),
      password: datos.password,
      rol: valorRol(datos.rol),
    }),
  )
  return aUsuarioFront(creado)
}

export async function actualizarUsuarioAdmin(id, datos) {
  const editado = await llamar(
    api.put(`${BASE}/${id}`, {
      nombre: datos.nombre.trim(),
      email: datos.email.trim().toLowerCase(),
      rol: valorRol(datos.rol),
    }),
  )
  return aUsuarioFront(editado)
}

export async function eliminarUsuarioAdmin(id) {
  await llamar(api.delete(`${BASE}/${id}`))
}
