import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FiltroCatalogo from '../components/FiltroCatalogo'
import TarjetaProducto from '../components/TarjetaProducto'
import { obtenerProductos } from '../data/almacen'
import { useCarrito } from '../context/CarritoContext'
import { useTitulo } from '../hooks/useTitulo'
import { FILTROS_INICIALES, filtrarProductos } from '../utils/filtrarProductos'

function Catalogo() {
  useTitulo('Catálogo de Productos - Ferretería Los Maestros')

  const [productos] = useState(obtenerProductos)
  const { agregar } = useCarrito()
  const [params] = useSearchParams()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  // el texto lo escribe el buscador de la barra lateral y viaja en la URL (?buscar=...)
  const texto = params.get('buscar') ?? ''

  const marcas = useMemo(
    () => [...new Set(productos.map((p) => p.marca).filter(Boolean))].sort(),
    [productos],
  )

  const visibles = useMemo(() => filtrarProductos(productos, filtros, texto), [productos, filtros, texto])

  return (
    <main className="container-fluid py-4 bg-light">
      <div className="row g-4">
        <aside className="col-12 col-lg-2">
          <FiltroCatalogo filtros={filtros} marcas={marcas} onChange={setFiltros} />
        </aside>

        <section id="catalogo" className="col-12 col-lg-10 bg-white p-3 rounded shadow-sm">
          <h2 className="h5 m-0 fw-bold">Todos los Productos</h2>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom">
            <span className="text-muted small">
              Mostrando {visibles.length} producto{visibles.length === 1 ? '' : 's'}
              {texto && <> para «{texto}»</>}
            </span>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="ordenar" className="small text-nowrap">Ordenar por:</label>
              <select
                id="ordenar"
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filtros.orden}
                onChange={(e) => setFiltros({ ...filtros, orden: e.target.value })}
              >
                <option value="destacados">Destacados</option>
                <option value="1">Menor a mayor precio</option>
                <option value="2">Mayor a menor precio</option>
              </select>
            </div>
          </div>

          <div className="lista-productos pe-lg-2">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 mx-0">
              {visibles.length === 0 ? (
                <p className="text-muted small col-12 p-3">
                  No se encontraron productos con los filtros seleccionados.
                </p>
              ) : (
                visibles.map((p) => <TarjetaProducto key={p.id} producto={p} onAgregar={agregar} />)
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Catalogo
