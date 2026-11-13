import { REGION_DESPACHO } from '../data/despacho'
import { leer, guardar } from '../utils/storage'

export const MAX_DIRECCIONES = 5
const CLAVE = 'direcciones'

function limpiar(datos) {
  return {
    alias: datos.alias?.trim() || 'Principal',
    calle: datos.calle.trim(),
    numero: (datos.numero ?? '').trim(),
    departamento: datos.departamento?.trim() ?? '',
    comuna: datos.comuna,
    region: REGION_DESPACHO,
    indicaciones: datos.indicaciones?.trim() ?? '',
  }
}

function ordenar(lista) {
  return [...lista].sort((a, b) => Number(b.predeterminada) - Number(a.predeterminada) || a.id - b.id)
}

function guardarLista(usuario, lista) {
  const mapa = leer(CLAVE, {})
  mapa[usuario.rut] = lista
  guardar(CLAVE, mapa)
}

function listaDe(usuario) {
  const mapa = leer(CLAVE, {})
  if (mapa[usuario.rut]) return mapa[usuario.rut]

  const lista = usuario.direccion?.calle ? [{ ...limpiar(usuario.direccion), id: 1, predeterminada: true }] : []
  guardarLista(usuario, lista)
  return lista
}

function buscar(lista, id) {
  const direccion = lista.find((d) => d.id === id)
  if (!direccion) throw new Error('Dirección no encontrada')
  return direccion
}

export async function listarDirecciones(usuario) {
  return ordenar(listaDe(usuario))
}

export async function agregarDireccion(usuario, datos) {
  const lista = listaDe(usuario)
  if (lista.length >= MAX_DIRECCIONES) {
    throw new Error(`Puedes guardar hasta ${MAX_DIRECCIONES} direcciones`)
  }

  const nueva = {
    ...limpiar(datos),
    id: Math.max(0, ...lista.map((d) => d.id)) + 1,
    predeterminada: lista.length === 0,
  }
  guardarLista(usuario, [...lista, nueva])
  return nueva
}

export async function actualizarDireccion(usuario, id, datos) {
  const lista = listaDe(usuario)
  const actual = buscar(lista, id)
  const editada = { ...limpiar(datos), id, predeterminada: actual.predeterminada }
  guardarLista(usuario, lista.map((d) => (d.id === id ? editada : d)))
  return editada
}

export async function marcarPredeterminada(usuario, id) {
  const lista = listaDe(usuario)
  buscar(lista, id)
  const nuevaLista = lista.map((d) => ({ ...d, predeterminada: d.id === id }))
  guardarLista(usuario, nuevaLista)
  return nuevaLista.find((d) => d.id === id)
}

export async function eliminarDireccion(usuario, id) {
  const lista = listaDe(usuario)
  const eliminada = buscar(lista, id)
  const resto = lista.filter((d) => d.id !== id)

  if (eliminada.predeterminada && resto.length > 0) {
    const siguiente = Math.min(...resto.map((d) => d.id))
    resto.forEach((d) => {
      d.predeterminada = d.id === siguiente
    })
  }
  guardarLista(usuario, resto)
}

export function borrarDireccionesDe(rut) {
  const mapa = leer(CLAVE, {})
  delete mapa[rut]
  guardar(CLAVE, mapa)
}
