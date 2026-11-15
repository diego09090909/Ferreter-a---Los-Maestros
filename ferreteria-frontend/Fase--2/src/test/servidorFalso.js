import { AxiosError } from 'axios'
import { leer, guardar } from '../utils/storage'
import { etiquetaRol, valorRol } from '../utils/roles'
import { formatearRut } from '../utils/rut'

const MAX_DIRECCIONES = 5
const REGION = 'Región de Coquimbo'

const sinPuntos = (rut) => String(rut ?? '').replace(/\./g, '').toUpperCase()
const mismoRut = (a, b) => sinPuntos(a) === sinPuntos(b)
const mismoEmail = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase()
const idDe = (usuario) => Number(sinPuntos(usuario.rut).split('-')[0])

const usuarios = () => leer('usuarios', [])
const guardarUsuarios = (lista) => guardar('usuarios', lista)
const todasLasDirecciones = () => leer('direcciones', {})
const guardarDirecciones = (todas) => guardar('direcciones', todas)
// ventas con la misma forma que VentaResponse de ms-ventas, la mas reciente primero
const ventas = () => [...leer('ventas', [])].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

function aRespuesta(usuario) {
  return {
    id: idDe(usuario),
    nombre: usuario.nombre,
    rut: usuario.rut,
    email: usuario.email,
    rol: valorRol(usuario.rol),
    direcciones: [],
  }
}

function aAuth(usuario) {
  return {
    token: 'token-de-prueba',
    refreshToken: 'refresh-de-prueba',
    tipo: 'Bearer',
    expiraEnMs: 900000,
    usuario: aRespuesta(usuario),
  }
}

class ErrorHttp {
  constructor(status, mensaje) {
    this.status = status
    this.mensaje = mensaje
  }
}

function usuarioActual() {
  const sesion = leer('usuarioActivo', null)
  const usuario = sesion && usuarios().find((u) => mismoRut(u.rut, sesion.rut))
  if (!usuario) throw new ErrorHttp(401, 'No autenticado')
  return usuario
}

function validarNuevo({ email, rut }) {
  const lista = usuarios()
  if (lista.some((u) => mismoEmail(u.email, email))) throw new ErrorHttp(409, 'El email ya esta registrado')
  if (lista.some((u) => mismoRut(u.rut, rut))) throw new ErrorHttp(409, 'El RUT ya esta registrado')
}

function validarEmailLibre(email, rutPropio) {
  if (usuarios().some((u) => !mismoRut(u.rut, rutPropio) && mismoEmail(u.email, email))) {
    throw new ErrorHttp(409, 'El email ya esta registrado')
  }
}

function actualizarUsuario(rut, cambios) {
  const lista = usuarios()
  const actualizado = { ...lista.find((u) => mismoRut(u.rut, rut)), ...cambios }
  guardarUsuarios(lista.map((u) => (mismoRut(u.rut, rut) ? actualizado : u)))
  return actualizado
}

function ordenar(lista) {
  return [...lista].sort((a, b) => Number(b.predeterminada) - Number(a.predeterminada) || a.id - b.id)
}

function direccionesDe(usuario) {
  return todasLasDirecciones()[usuario.rut] ?? []
}

function guardarDireccionesDe(usuario, lista) {
  guardarDirecciones({ ...todasLasDirecciones(), [usuario.rut]: lista })
}

function nuevaDireccion(lista, datos) {
  return {
    id: Math.max(0, ...lista.map((d) => d.id)) + 1,
    alias: (datos.alias ?? '').trim() || 'Principal',
    calle: datos.calle,
    numero: datos.numero ?? '',
    departamento: datos.departamento ?? '',
    comuna: datos.comuna,
    region: datos.region || REGION,
    indicaciones: datos.indicaciones ?? '',
    predeterminada: lista.length === 0,
  }
}

function buscarDireccion(lista, id) {
  const direccion = lista.find((d) => d.id === id)
  if (!direccion) throw new ErrorHttp(404, 'Direccion no encontrada')
  return direccion
}

function buscarPorId(id) {
  const usuario = usuarios().find((u) => idDe(u) === id)
  if (!usuario) throw new ErrorHttp(404, 'Usuario no encontrado')
  return usuario
}

const rutas = [
  ['POST', /^\/auth\/refresh$/, (cuerpo) => {
    if (cuerpo.refreshToken !== 'refresh-de-prueba') throw new ErrorHttp(401, 'Token de renovación inválido')
    return [200, aAuth(usuarioActual())]
  }],
  ['POST', /^\/auth\/login$/, (cuerpo) => {
    const identificador = String(cuerpo.usuario ?? '').trim()
    const usuario = usuarios().find((u) => mismoEmail(u.email, identificador) || mismoRut(u.rut, identificador))
    if (!usuario || usuario.password !== cuerpo.password) throw new ErrorHttp(401, 'Credenciales inválidas')
    return [200, aAuth(usuario)]
  }],
  ['POST', /^\/auth\/registro$/, (cuerpo) => {
    validarNuevo(cuerpo)
    const nuevo = {
      rut: formatearRut(cuerpo.rut),
      nombre: cuerpo.nombre,
      email: cuerpo.email,
      password: cuerpo.password,
      rol: etiquetaRol('CLIENTE'),
    }
    guardarUsuarios([...usuarios(), nuevo])
    if (cuerpo.direccion) guardarDireccionesDe(nuevo, [nuevaDireccion([], cuerpo.direccion)])
    return [201, aAuth(nuevo)]
  }],
  ['GET', /^\/usuarios\/me$/, () => [200, aRespuesta(usuarioActual())]],
  ['PUT', /^\/usuarios\/me$/, (cuerpo) => {
    const actual = usuarioActual()
    validarEmailLibre(cuerpo.email, actual.rut)
    return [200, aRespuesta(actualizarUsuario(actual.rut, { nombre: cuerpo.nombre, email: cuerpo.email }))]
  }],
  ['PUT', /^\/usuarios\/me\/password$/, (cuerpo) => {
    const actual = usuarioActual()
    if (actual.password !== cuerpo.passwordActual) throw new ErrorHttp(401, 'La contraseña actual es incorrecta')
    if (cuerpo.passwordActual === cuerpo.passwordNueva) {
      throw new ErrorHttp(400, 'La nueva contraseña no puede ser igual a la actual')
    }
    actualizarUsuario(actual.rut, { password: cuerpo.passwordNueva })
    return [204, null]
  }],
  ['GET', /^\/usuarios\/me\/direcciones$/, () => [200, ordenar(direccionesDe(usuarioActual()))]],
  ['POST', /^\/usuarios\/me\/direcciones$/, (cuerpo) => {
    const usuario = usuarioActual()
    const lista = direccionesDe(usuario)
    if (lista.length >= MAX_DIRECCIONES) {
      throw new ErrorHttp(400, `Puedes guardar hasta ${MAX_DIRECCIONES} direcciones`)
    }
    const nueva = nuevaDireccion(lista, cuerpo)
    guardarDireccionesDe(usuario, [...lista, nueva])
    return [201, nueva]
  }],
  ['PUT', /^\/usuarios\/me\/direcciones\/(\d+)\/predeterminada$/, (_cuerpo, [id]) => {
    const usuario = usuarioActual()
    const lista = direccionesDe(usuario)
    buscarDireccion(lista, id)
    const nuevas = lista.map((d) => ({ ...d, predeterminada: d.id === id }))
    guardarDireccionesDe(usuario, nuevas)
    return [200, nuevas.find((d) => d.id === id)]
  }],
  ['PUT', /^\/usuarios\/me\/direcciones\/(\d+)$/, (cuerpo, [id]) => {
    const usuario = usuarioActual()
    const lista = direccionesDe(usuario)
    const actual = buscarDireccion(lista, id)
    const editada = {
      ...actual,
      ...cuerpo,
      alias: (cuerpo.alias ?? '').trim() || 'Principal',
      region: cuerpo.region || actual.region || REGION,
      id,
      predeterminada: actual.predeterminada,
    }
    guardarDireccionesDe(usuario, lista.map((d) => (d.id === id ? editada : d)))
    return [200, editada]
  }],
  ['DELETE', /^\/usuarios\/me\/direcciones\/(\d+)$/, (_cuerpo, [id]) => {
    const usuario = usuarioActual()
    const lista = direccionesDe(usuario)
    const eliminada = buscarDireccion(lista, id)
    let restantes = lista.filter((d) => d.id !== id)
    if (eliminada.predeterminada && restantes.length > 0) {
      const primera = ordenar(restantes.map((d) => ({ ...d, predeterminada: false })))[0]
      restantes = restantes.map((d) => ({ ...d, predeterminada: d.id === primera.id }))
    }
    guardarDireccionesDe(usuario, restantes)
    return [204, null]
  }],
  ['GET', /^\/admin\/usuarios$/, () => [200, usuarios().map(aRespuesta)]],
  ['POST', /^\/admin\/usuarios$/, (cuerpo) => {
    validarNuevo(cuerpo)
    const nuevo = {
      rut: formatearRut(cuerpo.rut),
      nombre: cuerpo.nombre,
      email: cuerpo.email,
      password: cuerpo.password,
      rol: etiquetaRol(cuerpo.rol),
    }
    guardarUsuarios([...usuarios(), nuevo])
    return [201, aRespuesta(nuevo)]
  }],
  ['PUT', /^\/admin\/usuarios\/(\d+)$/, (cuerpo, [id]) => {
    const usuario = buscarPorId(id)
    validarEmailLibre(cuerpo.email, usuario.rut)
    const cambios = { nombre: cuerpo.nombre, email: cuerpo.email, rol: etiquetaRol(cuerpo.rol) }
    return [200, aRespuesta(actualizarUsuario(usuario.rut, cambios))]
  }],
  ['GET', /^\/ventas\/mis-ventas$/, () => {
    const id = idDe(usuarioActual())
    return [200, ventas().filter((v) => v.usuarioId === id)]
  }],
  ['GET', /^\/ventas$/, () => [200, ventas()]],
  ['PATCH', /^\/ventas\/(\d+)\/estado$/, (cuerpo, [id]) => {
    const lista = leer('ventas', [])
    const venta = lista.find((v) => v.id === id)
    if (!venta) throw new ErrorHttp(404, 'Venta no encontrada')
    const actualizada = { ...venta, estado: cuerpo.estado }
    guardar('ventas', lista.map((v) => (v.id === id ? actualizada : v)))
    return [200, actualizada]
  }],
  ['DELETE', /^\/admin\/usuarios\/(\d+)$/, (_cuerpo, [id]) => {
    const usuario = buscarPorId(id)
    guardarUsuarios(usuarios().filter((u) => !mismoRut(u.rut, usuario.rut)))
    const todas = todasLasDirecciones()
    delete todas[usuario.rut]
    guardarDirecciones(todas)
    return [204, null]
  }],
]

function rutaDe(url) {
  const ruta = new URL(url, 'http://localhost').pathname
  return ruta.replace(/^\/api\/v1/, '')
}

function leerCuerpo(data) {
  if (typeof data !== 'string') return data ?? {}
  try {
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export default async function servidorFalso(config) {
  const metodo = config.method.toUpperCase()
  const ruta = rutaDe(config.url)
  const request = {}

  for (const [verbo, patron, manejar] of rutas) {
    const coincidencia = verbo === metodo && ruta.match(patron)
    if (!coincidencia) continue

    try {
      const [status, data] = manejar(leerCuerpo(config.data), coincidencia.slice(1).map(Number))
      return { data, status, statusText: String(status), headers: {}, config, request }
    } catch (error) {
      if (!(error instanceof ErrorHttp)) throw error
      const response = { data: { mensaje: error.mensaje }, status: error.status, statusText: '', headers: {}, config, request }
      throw new AxiosError(error.mensaje, AxiosError.ERR_BAD_REQUEST, config, request, response)
    }
  }

  throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request)
}
