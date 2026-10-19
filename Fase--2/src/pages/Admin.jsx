import { useEffect, useRef, useState } from 'react'
import { obtenerProductos } from '../data/almacen'
import { useTitulo } from '../hooks/useTitulo'
import { obtenerUsuarios } from '../services/usuarios'
import { leer } from '../utils/storage'
import { formatearPrecio } from '../utils/formato'

const SECCIONES = [
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'bi-box-seam' },
  { id: 'usuarios', etiqueta: 'Usuarios', icono: 'bi-people' },
  { id: 'stock', etiqueta: 'Stock', icono: 'bi-bricks' },
  { id: 'ventas', etiqueta: 'Ventas', icono: 'bi-graph-up-arrow' },
]
const PEDIDOS_EJEMPLO = [
  { id: 101, cliente: 'Juan Pérez', tipoPago: 'WebPay (Debito)', tipoEntrega: 'Despacho a Domicilio', total: 49990, estado: 'Pendiente' },
  { id: 102, cliente: 'María González', tipoPago: 'Transferencia', tipoEntrega: 'Retiro en Tienda', total: 15600, estado: 'Entregado' },
]
const VENTAS_EJEMPLO = [
  { id: 501, fecha: '11/09/2026', categoria: 'Herramientas', monto: 49990, medioPago: 'Débito' },
  { id: 502, fecha: '10/09/2026', categoria: 'Construccion', monto: 15600, medioPago: 'Crédito' },
]
function partesFecha(fecha) {
  const [, mes = '', anio = ''] = String(fecha).split(/[/-]/)
  return { mes: mes.padStart(2, '0'), anio }
}

function Tabla({ titulo, columnas, acciones, filtros, children }) {
  const tablaRef = useRef(null)

  useEffect(() => {
    tablaRef.current.querySelectorAll('tbody tr').forEach((fila) => {
      fila.querySelectorAll('td').forEach((celda, i) => {
        if (celda.colSpan === 1) celda.setAttribute('data-label', columnas[i])
      })
    })
  })

  return (
    <section className="bg-white p-3 rounded border shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 fw-bold mb-0">{titulo}</h2>
        {acciones}
      </div>
      {filtros}
      <div className="table-responsive">
        <table ref={tablaRef} className="table table-striped table-hover align-middle small tabla-apilable">
          <thead className="table-dark">
            <tr>{columnas.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </section>
  )
}

function SeccionPedidos() {
  const [pedidos] = useState(() => leer('pedidos', PEDIDOS_EJEMPLO))
  return (
    <Tabla titulo="Pedidos del Mes" columnas={['ID', 'Cliente', 'Tipo Pago', 'Entrega', 'Total', 'Estado']}>
      {pedidos.map((p) => (
        <tr key={p.id}>
          <td>#PED-{p.id}</td>
          <td>{p.cliente}</td>
          <td><span className="badge bg-warning text-dark">{p.tipoPago}</span></td>
          <td>{p.tipoEntrega}</td>
          <td>{formatearPrecio(p.total)}</td>
          <td><span className="badge bg-info text-dark">{p.estado}</span></td>
        </tr>
      ))}
    </Tabla>
  )
}

function SeccionUsuarios() {
  const [usuarios] = useState(obtenerUsuarios)
  return (
    <Tabla
      titulo="Usuarios Registrados"
      columnas={['RUT', 'Nombre', 'Correo', 'Rol', 'Estado']}
      acciones={<button type="button" className="btn btn-sm btn-success">+ Nuevo Usuario</button>}
    >
      {usuarios.map((u) => (
        <tr key={u.rut}>
          <td>{u.rut}</td>
          <td>{u.nombre}</td>
          <td>{u.email}</td>
          <td>
            <span className={`badge ${u.rol === 'Administrador' ? 'bg-primary' : 'bg-secondary'}`}>{u.rol}</span>
          </td>
          <td><span className="badge bg-success">Activo</span></td>
        </tr>
      ))}
    </Tabla>
  )
}

function SeccionStock() {
  const [productos] = useState(obtenerProductos)

  return (
    <Tabla
      titulo="Control de Inventario y Bodega"
      columnas={['ID', 'Producto', 'Categoría', 'Stock Tienda', 'Bodega', 'Estado Stock']}
    >
      {productos.length === 0 && (
        <tr>
          <td colSpan="6" className="text-center text-muted">No hay productos en inventario.</td>
        </tr>
      )}
      {productos.map((p) => {
        const tienda = p.stockTienda ?? 0
        const bodega = p.stockBodega ?? 0
        let estado = <span className="badge bg-success">Disponible</span>
        if (tienda + bodega === 0) estado = <span className="badge bg-danger">Agotado</span>
        else if (tienda < 5) estado = <span className="badge bg-warning text-dark">Stock Bajo</span>

        return (
          <tr key={p.id}>
            <td>{p.id}</td>
            <td>{p.nombre}</td>
            <td>{p.categoria || 'General'}</td>
            <td>{tienda}</td>
            <td>{bodega}</td>
            <td>{estado}</td>
          </tr>
        )
      })}
    </Tabla>
  )
}

function SeccionVentas() {
  const [ventas] = useState(() => leer('ventas', VENTAS_EJEMPLO))
  const [anio, setAnio] = useState('')
  const [mes, setMes] = useState('')

  const visibles = ventas.filter((v) => {
    const f = partesFecha(v.fecha)
    return (anio === '' || f.anio === anio) && (mes === '' || f.mes === mes)
  })

  return (
    <Tabla
      titulo="Histórico de Ventas"
      columnas={['N° Venta', 'Fecha', 'Categoría', 'Monto', 'Medio Pago']}
      filtros={
        <div className="row g-2 mb-3">
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              aria-label="Filtrar por año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            >
              <option value="">Filtrar por Año</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              aria-label="Filtrar por mes"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            >
              <option value="">Filtrar por Mes</option>
              <option value="10">Octubre</option>
              <option value="09">Septiembre</option>
              <option value="08">Agosto</option>
            </select>
          </div>
        </div>
      }
    >
      {visibles.map((v) => (
        <tr key={v.id}>
          <td>#VNT-{v.id}</td>
          <td>{v.fecha}</td>
          <td>{v.categoria}</td>
          <td>{formatearPrecio(v.monto)}</td>
          <td>{v.medioPago}</td>
        </tr>
      ))}
    </Tabla>
  )
}

const VISTAS = {
  pedidos: SeccionPedidos,
  usuarios: SeccionUsuarios,
  stock: SeccionStock,
  ventas: SeccionVentas,
}

function Admin() {
  useTitulo('Panel de Administración - Ferretería Los Maestros')
  const [seccion, setSeccion] = useState('pedidos')
  const Vista = VISTAS[seccion]

  return (
    <main className="container-fluid pt-3">
      <div className="row g-3">
        <aside className="col-12 col-md-3 col-lg-2">
          <div className="bg-white p-3 rounded border shadow-sm sticky-md-top" style={{ top: 90 }}>
            <h2 className="h6 fw-bold mb-3 border-bottom pb-2">Panel Admin</h2>
            <nav className="d-grid gap-2">
              {SECCIONES.map(({ id, etiqueta, icono }) => (
                <button
                  key={id}
                  type="button"
                  className={`btn text-start ${seccion === id ? 'btn-primary active' : 'btn-outline-secondary text-dark'}`}
                  onClick={() => setSeccion(id)}
                >
                  <i className={`bi ${icono} me-2`}></i> {etiqueta}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="col-12 col-md-9 col-lg-10 contenido-admin">
          <Vista />
        </div>
      </div>
    </main>
  )
}

export default Admin
