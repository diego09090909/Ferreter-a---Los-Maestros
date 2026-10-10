import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

function Inicio() {
  return <h1>Inicio</h1>
}

function App() {
  return (
    <>
      <Navbar />
      <main className="container" style={{ paddingTop: '90px' }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
        </Routes>
      </main>
    </>
  )
}

export default App