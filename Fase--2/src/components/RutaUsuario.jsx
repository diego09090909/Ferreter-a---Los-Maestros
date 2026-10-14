import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Solo deja pasar a quien tiene la sesión iniciada.
// Si no hay sesión, lo manda al login; si acaba de cerrar sesión, al inicio.
function RutaUsuario({ children }) {
  const { usuario, saliendoRef } = useAuth()
  const alSalir = saliendoRef.current

  useEffect(() => {
    if (!usuario) saliendoRef.current = false
  }, [usuario, saliendoRef])

  if (!usuario) return <Navigate to={alSalir ? '/' : '/login'} replace />
  return children
}

export default RutaUsuario
