import { Accordion } from 'react-bootstrap'

function FiltroCatalogo({ filtros, categorias, marcas, tope, onChange }) {
  const precioElegido = filtros.precioMaximo ?? tope
  const cambiar = (parcial) => onChange({ ...filtros, ...parcial })

  const alternarCategoria = (valor) => {
    const seleccionadas = filtros.categorias.includes(valor)
      ? filtros.categorias.filter((c) => c !== valor)
      : [...filtros.categorias, valor]
    cambiar({ categorias: seleccionadas })
  }

  return (
    <div className="bg-white p-3 rounded border shadow-sm sticky-lg-top" style={{ top: 90, zIndex: 100 }}>
      <h2>Filtros</h2>

      <Accordion flush>
        <Accordion.Item eventKey="categorias">
          <Accordion.Header>Categoría de Productos</Accordion.Header>
          <Accordion.Body className="px-0">
            {categorias.map(({ id, nombre, etiqueta }) => (
              <div className="form-check" key={id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`cat-${id}`}
                  checked={filtros.categorias.includes(nombre)}
                  onChange={() => alternarCategoria(nombre)}
                />
                <label className="form-check-label small" htmlFor={`cat-${id}`}>
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
              Precio máximo: ${precioElegido.toLocaleString('es-CL')}
            </label>
            <input
              type="range"
              className="form-range"
              id="rango"
              min="0"
              max={tope}
              step="1000"
              value={precioElegido}
              onChange={(e) => cambiar({ precioMaximo: Number(e.target.value) })}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

export default FiltroCatalogo
