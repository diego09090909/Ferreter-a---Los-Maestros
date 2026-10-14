import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
