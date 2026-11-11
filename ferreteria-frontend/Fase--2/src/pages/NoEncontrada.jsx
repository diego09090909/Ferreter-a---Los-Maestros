import { Link } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

function NoEncontrada() {
  useTitulo('Página no encontrada - Ferretería Los Maestros')

  return (
    <main className="container py-5 text-center">
      <i className="bi bi-signpost-split display-1 text-secondary"></i>
      <h1 className="h3 fw-bold mt-3">Página no encontrada</h1>
      <p className="text-secondary">La dirección que buscas no existe o fue movida.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </main>
  )
}

export default NoEncontrada
