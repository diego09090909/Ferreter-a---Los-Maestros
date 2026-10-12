import { leer, guardar } from '../utils/storage'

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
