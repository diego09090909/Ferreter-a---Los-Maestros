import { createContext, useContext, useRef, useState } from 'react'
import { leer, guardar, borrar } from '../utils/storage'
import { guardarUsuarios, inicializarAdminPorDefecto, obtenerUsuarios } from '../services/usuarios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    inicializarAdminPorDefecto()
    return leer('usuarioActivo', null)
  })

  // true mientras se cierra la sesión a propósito: la ruta protegida usa esto para volver al inicio
  const saliendoRef = useRef(false)

  const iniciarSesion = (u) => {
    saliendoRef.current = false
    guardar('usuarioActivo', u)
    setUsuario(u)
  }

  const cerrarSesion = () => {
    saliendoRef.current = true
    borrar('usuarioActivo')
    setUsuario(null)
  }

  // guarda los datos nuevos del usuario (en la lista de usuarios y en la sesión)
  const actualizarUsuario = (cambios) => {
    const nuevo = { ...usuario, ...cambios }
    guardarUsuarios(obtenerUsuarios().map((u) => (u.rut === usuario.rut ? nuevo : u)))
    guardar('usuarioActivo', nuevo)
    setUsuario(nuevo)
  }

  const esAdmin = usuario?.rol === 'Administrador'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, iniciarSesion, cerrarSesion, actualizarUsuario, saliendoRef }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
