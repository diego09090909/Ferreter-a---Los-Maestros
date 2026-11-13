import { useState } from 'react'
import { obtenerProductos } from '../data/almacen'
import { useTitulo } from '../hooks/useTitulo'
import ModalEditarUsuario from '../components/ModalEditarUsuario'
import ModalNuevoUsuario from '../components/ModalNuevoUsuario'
import { useAuth } from '../context/AuthContext'
import { eliminarUsuarioAdmin, obtenerUsuarios } from '../services/usuarios'
import { colorRol } from '../utils/roles'
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
  return (
    <section className="bg-white p-3 rounded border shadow-sm mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h5 fw-bold mb-0">{titulo}</h2>
        {acciones}
      </div>
      {filtros}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle small tabla-apilable">
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
          <td data-label="ID">#PED-{p.id}</td>
          <td data-label="Cliente">{p.cliente}</td>
          <td data-label="Tipo Pago"><span className="badge bg-warning text-dark">{p.tipoPago}</span></td>
          <td data-label="Entrega">{p.tipoEntrega}</td>
          <td data-label="Total">{formatearPrecio(p.total)}</td>
          <td data-label="Estado"><span className="badge bg-info text-dark">{p.estado}</span></td>
        </tr>
      ))}
    </Tabla>
  )
}

function SeccionUsuarios() {
  const { usuario: admin, actualizarUsuario } = useAuth()
  const [usuarios, setUsuarios] = useState(obtenerUsuarios)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [porEliminar, setPorEliminar] = useState(null)
  const [aviso, setAviso] = useState(null)
  const recargar = () => setUsuarios(obtenerUsuarios())
  const alCrear = (nuevo) => {
    recargar()
    setAviso({ tipo: 'success', texto: `Se creó la cuenta de ${nuevo.nombre} (${nuevo.rol}).` })
  }

  const alEditar = (editado) => {
    // si el admin se edita a si mismo, tambien se actualiza su sesion (nombre y correo del navbar)
    if (editado.rut === admin.rut) actualizarUsuario({ nombre: editado.nombre, email: editado.email })
    setEditando(null)
    recargar()
    setAviso({ tipo: 'success', texto: `Se actualizó la cuenta de ${editado.nombre}.` })
  }

  const eliminar = async (u) => {
    try {
      await eliminarUsuarioAdmin(u.rut, admin.rut)
      recargar()
      setAviso({ tipo: 'success', texto: `Se eliminó la cuenta de ${u.nombre}.` })
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error.message })
    }
    setPorEliminar(null)
  }

  return (
    <>
      {aviso && (
        <div className={`alert alert-${aviso.tipo} alert-dismissible`} role={aviso.tipo === 'danger' ? 'alert' : 'status'}>
          {aviso.texto}
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)}></button>
        </div>
      )}
      <Tabla
        titulo="Usuarios Registrados"
        columnas={['RUT', 'Nombre', 'Correo', 'Rol', 'Estado', 'Acciones']}
        acciones={
          <button type="button" className="btn btn-sm btn-success" onClick={() => setMostrarModal(true)}>
            + Nuevo Usuario
          </button>
        }
      >
        {usuarios.map((u) => {
          const esPropia = u.rut === admin.rut
          return (
            <tr key={u.rut}>
              <td data-label="RUT">{u.rut}</td>
              <td data-label="Nombre">
                {u.nombre}
                {esPropia && <span className="badge bg-light text-dark border ms-2">Tú</span>}
              </td>
              <td data-label="Correo">{u.email}</td>
              <td data-label="Rol">
                <span className={`badge ${colorRol(u.rol)}`}>{u.rol}</span>
              </td>
              <td data-label="Estado"><span className="badge bg-success">Activo</span></td>
              <td data-label="Acciones">
                {porEliminar === u.rut ? (
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span>¿Eliminar a {u.nombre}?</span>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => eliminar(u)}>Sí, eliminar</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setPorEliminar(null)}>No</button>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      aria-label={`Editar a ${u.nombre}`}
                      onClick={() => setEditando(u)}
                    >
                      <i className="bi bi-pencil"></i> Editar
                    </button>
                    {!esPropia && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        aria-label={`Eliminar a ${u.nombre}`}
                        onClick={() => setPorEliminar(u.rut)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          )
        })}
      </Tabla>
      <ModalNuevoUsuario mostrar={mostrarModal} onCerrar={() => setMostrarModal(false)} onCreado={alCrear} />
      {editando && (
        <ModalEditarUsuario
          key={editando.rut}
          usuario={editando}
          rutAdmin={admin.rut}
          onCerrar={() => setEditando(null)}
          onGuardado={alEditar}
        />
      )}
    </>
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
            <td data-label="ID">{p.id}</td>
            <td data-label="Producto">{p.nombre}</td>
            <td data-label="Categoría">{p.categoria || 'General'}</td>
            <td data-label="Stock Tienda">{tienda}</td>
            <td data-label="Bodega">{bodega}</td>
            <td data-label="Estado Stock">{estado}</td>
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
          <td data-label="N° Venta">#VNT-{v.id}</td>
          <td data-label="Fecha">{v.fecha}</td>
          <td data-label="Categoría">{v.categoria}</td>
          <td data-label="Monto">{formatearPrecio(v.monto)}</td>
          <td data-label="Medio Pago">{v.medioPago}</td>
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
