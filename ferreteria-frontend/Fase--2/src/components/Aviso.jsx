function Aviso({ mensaje }) {
  if (!mensaje) return null
  return (
    <div className={`alert alert-${mensaje.tipo} mt-3 mb-0`} role="alert">
      {mensaje.texto}
    </div>
  )
}

export default Aviso
