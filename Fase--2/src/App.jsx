import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Cobertura from './pages/Cobertura'

function Inicio() {
  return <h1>Inicio</h1>
}

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cobertura" element={<Cobertura />} />
        </Routes>
      </main>
    </>
  )
}

export default App