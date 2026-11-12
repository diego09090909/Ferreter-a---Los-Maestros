import { leer, guardar } from '../utils/storage'
import { formatearRut, limpiarRut } from '../utils/rut'
import { etiquetaRol } from '../utils/roles'

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


// Crea una cuenta de personal (Administrador o Vendedor) desde el panel admin.
// Recibe los mismos datos que CrearUsuarioRequest de ms-usuarios: { nombre, rut, email, password, rol }
// con rol 'ADMIN' o 'VENDEDOR'.
// Por ahora se guarda en el navegador; al conectar con ms-usuarios este cuerpo se reemplaza por:
//   const { data } = await api.post('/api/v1/admin/usuarios', datos)
//   return data
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
