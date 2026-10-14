import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Solo deja pasar a administradores; al resto lo manda al login con un aviso.
function RutaAdmin({ children }) {
  const { esAdmin } = useAuth()
  if (!esAdmin) return <Navigate to="/login" replace state={{ accesoDenegado: true }} />
  return children
}

export default RutaAdmin
