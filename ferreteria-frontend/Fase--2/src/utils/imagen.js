export const SIN_IMAGEN = '/imagenes/sin-imagen.svg'

export function imagenDe(producto) {
  return producto?.imagen || SIN_IMAGEN
}
