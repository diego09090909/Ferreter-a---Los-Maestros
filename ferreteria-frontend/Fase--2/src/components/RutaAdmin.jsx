import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RutaAdmin({ children }) {
  const { esAdmin, esVendedor } = useAuth()
  if (!esAdmin && !esVendedor) return <Navigate to="/login" replace state={{ accesoDenegado: true }} />
  return children
}

export default RutaAdmin
