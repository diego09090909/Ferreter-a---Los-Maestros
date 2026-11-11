function ErrorCampo({ id, mensaje }) {
  if (!mensaje) return null
  return (
    <div id={id} className="invalid-feedback">
      {mensaje}
    </div>
  )
}

export default ErrorCampo
