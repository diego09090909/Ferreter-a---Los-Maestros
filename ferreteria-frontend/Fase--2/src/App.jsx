import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import Cobertura from './pages/Cobertura'
import Login from './pages/Login'
import Carrito from './pages/Carrito'
import Catalogo from './pages/Catalogo'
import Admin from './pages/Admin'
import Footer from './components/Footer'
import RutaAdmin from './components/RutaAdmin'
import RutaUsuario from './components/RutaUsuario'
import MiCuenta from './pages/MiCuenta'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cobertura" element={<Cobertura />} />
          <Route path="/login" element={<Login />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/mi-cuenta" element={<RutaUsuario><MiCuenta /></RutaUsuario>} />
          <Route path="/admin" element={<RutaAdmin><Admin /></RutaAdmin>} />
      </Routes>
      <Footer />
    </>
  )
}

export default App