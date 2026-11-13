// roles del sistema: "valor" es el del enum Rol de ms-usuarios y "etiqueta" es el texto que se muestra
export const ROLES = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  CLIENTE: 'Cliente',
}

// el admin solo crea cuentas de personal; los clientes se registran desde la tienda
export const ROLES_CREABLES_POR_ADMIN = ['ADMIN', 'VENDEDOR']

export function etiquetaRol(valor) {
  return ROLES[valor] ?? valor
}

// lo contrario de etiquetaRol: 'Vendedor' -> 'VENDEDOR'
export function valorRol(etiqueta) {
  return Object.keys(ROLES).find((valor) => ROLES[valor] === etiqueta) ?? etiqueta
}

// color del badge de cada rol en las tablas
export function colorRol(etiqueta) {
  if (etiqueta === ROLES.ADMIN) return 'bg-primary'
  if (etiqueta === ROLES.VENDEDOR) return 'bg-info text-dark'
  return 'bg-secondary'
}
