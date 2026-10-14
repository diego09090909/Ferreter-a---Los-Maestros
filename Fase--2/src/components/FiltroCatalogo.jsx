import { Accordion } from 'react-bootstrap'
import { CATEGORIAS } from '../data/productos'
import { PRECIO_MAXIMO } from '../utils/filtrarProductos'

function FiltroCatalogo({ filtros, marcas, onChange }) {
  const cambiar = (parcial) => onChange({ ...filtros, ...parcial })

  const alternarCategoria = (valor) => {
    const categorias = filtros.categorias.includes(valor)
      ? filtros.categorias.filter((c) => c !== valor)
      : [...filtros.categorias, valor]
    cambiar({ categorias })
  }

  return (
    <div className="bg-white p-3 rounded border shadow-sm sticky-lg-top" style={{ top: 90, zIndex: 100 }}>
      <h2>Filtros</h2>

      <Accordion flush>
        <Accordion.Item eventKey="categorias">
          <Accordion.Header>Categoría de Productos</Accordion.Header>
          <Accordion.Body className="px-0">
            {CATEGORIAS.map(({ valor, etiqueta }) => (
              <div className="form-check" key={valor}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cat-${valor}`}
                  checked={filtros.categorias.includes(valor)}
                  onChange={() => alternarCategoria(valor)}
                />
                <label className="form-check-label small" htmlFor={`cat-${valor}`}>
                  {etiqueta}
                </label>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>

        <div className="accordion-item">
          <div className="my-3">
            <label htmlFor="filtro-marca" className="form-label fw-bold">Filtrar por Marca</label>
            <select
              id="filtro-marca"
              className="form-select"
              value={filtros.marca}
              onChange={(e) => cambiar({ marca: e.target.value })}
            >
              <option value="todas">Todas las marcas</option>
              {marcas.map((marca) => (
                <option key={marca} value={marca}>{marca}</option>
              ))}
            </select>
          </div>
        </div>

        <Accordion.Item eventKey="precio">
          <Accordion.Header>Rango de precio</Accordion.Header>
          <Accordion.Body className="px-0">
            <label htmlFor="rango" className="form-label small fw-bold">
              Precio máximo: ${filtros.precioMaximo.toLocaleString('es-CL')}
            </label>
            <input
              type="range"
              className="form-range"
              id="rango"
              min="0"
              max={PRECIO_MAXIMO}
              step="1000"
              value={filtros.precioMaximo}
              onChange={(e) => cambiar({ precioMaximo: Number(e.target.value) })}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

export default FiltroCatalogo
