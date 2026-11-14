import api, { mensajeDeError, URL_USUARIOS } from './api'

export const MAX_DIRECCIONES = 5

const BASE = `${URL_USUARIOS}/usuarios/me/direcciones`

function datosParaApi(datos) {
  return {
    alias: (datos.alias ?? '').trim(),
    calle: datos.calle.trim(),
    numero: (datos.numero ?? '').trim(),
    departamento: (datos.departamento ?? '').trim(),
    comuna: datos.comuna,
    indicaciones: (datos.indicaciones ?? '').trim(),
  }
}

async function llamar(peticion) {
  try {
    const { data } = await peticion
    return data
  } catch (error) {
    throw new Error(mensajeDeError(error))
  }
}

export function listarDirecciones() {
  return llamar(api.get(BASE))
}

export function agregarDireccion(_usuario, datos) {
  return llamar(api.post(BASE, datosParaApi(datos)))
}

export function actualizarDireccion(_usuario, id, datos) {
  return llamar(api.put(`${BASE}/${id}`, datosParaApi(datos)))
}

export function marcarPredeterminada(_usuario, id) {
  return llamar(api.put(`${BASE}/${id}/predeterminada`))
}

export function eliminarDireccion(_usuario, id) {
  return llamar(api.delete(`${BASE}/${id}`))
}

export function borrarDireccionesDe() {}