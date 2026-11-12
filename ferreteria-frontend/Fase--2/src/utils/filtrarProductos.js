import { sinTildes } from './formato'

export const FILTROS_INICIALES = {
  categorias: [],
  marca: 'todas',
  precioMaximo: null,
  orden: 'destacados',
}

export function precioTope(productos) {
  const mayor = Math.max(0, ...productos.map((p) => p.precio))
  return Math.ceil(mayor / 10000) * 10000
}


export function filtrarProductos(productos, filtros, texto = '') {
  const buscado = sinTildes(texto.trim())

  const resultado = productos.filter((p) => {
    const cumpleCategoria =
      filtros.categorias.length === 0 || filtros.categorias.includes(p.categoria)
    const cumpleMarca = filtros.marca === 'todas' || p.marca === filtros.marca
    const cumplePrecio = filtros.precioMaximo === null || p.precio <= filtros.precioMaximo


    const cumpleBusqueda =
      buscado === '' ||
      sinTildes(p.nombre).includes(buscado) ||
      sinTildes(p.descripcion || '').includes(buscado) ||
      sinTildes(p.marca || '').includes(buscado) ||
      sinTildes(p.subcategoria || '').includes(buscado)

    return cumpleCategoria && cumpleMarca && cumplePrecio && cumpleBusqueda
  })

  if (filtros.orden === '1') resultado.sort((a, b) => a.precio - b.precio)
  else if (filtros.orden === '2') resultado.sort((a, b) => b.precio - a.precio)
  else resultado.sort((a, b) => a.id - b.id)

  return resultado
}
