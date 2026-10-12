import { createContext, useContext, useState } from 'react'
import { leer, guardar, borrar } from '../utils/storage'
import { inicializarAdminPorDefecto } from '../services/usuarios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    inicializarAdminPorDefecto()
    return leer('usuarioActivo', null)
  })

  const iniciarSesion = (u) => {
    guardar('usuarioActivo', u)
    setUsuario(u)
  }

  const cerrarSesion = () => {
    borrar('usuarioActivo')
    setUsuario(null)
  }

  const esAdmin = usuario?.rol === 'Administrador'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
