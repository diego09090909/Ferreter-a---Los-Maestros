import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

function Inicio() {
  return <h1>Inicio</h1>
}

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
      </main>
    </>
  )
}

export default App