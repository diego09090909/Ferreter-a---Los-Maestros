import { sinTildes } from './formato'

export const PRECIO_MAXIMO = 100000

export const FILTROS_INICIALES = {
  categorias: [], 
  marca: 'todas',
  precioMaximo: PRECIO_MAXIMO,
  orden: 'destacados', 
}


export function filtrarProductos(productos, filtros, texto = '') {
  const buscado = sinTildes(texto.trim())

  const resultado = productos.filter((p) => {
    const cumpleCategoria =
      filtros.categorias.length === 0 || filtros.categorias.includes(p.categoria)
    const cumpleMarca = filtros.marca === 'todas' || p.marca === filtros.marca
    const cumplePrecio = p.precio <= filtros.precioMaximo


    const cumpleBusqueda =
      buscado === '' ||
      sinTildes(p.nombre).includes(buscado) ||
      sinTildes(p.descripcion || '').includes(buscado) ||
      sinTildes(p.marca || '').includes(buscado)

    return cumpleCategoria && cumpleMarca && cumplePrecio && cumpleBusqueda
  })

  if (filtros.orden === '1') resultado.sort((a, b) => a.precio - b.precio)
  else if (filtros.orden === '2') resultado.sort((a, b) => b.precio - a.precio)
  else resultado.sort((a, b) => a.id - b.id)

  return resultado
}
