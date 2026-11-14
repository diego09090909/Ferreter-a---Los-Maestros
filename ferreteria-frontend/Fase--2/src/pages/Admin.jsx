import { useEffect, useState } from 'react'
import { useTitulo } from '../hooks/useTitulo'
import ModalDetalle from '../components/ModalDetalle'
import ModalEditarUsuario from '../components/ModalEditarUsuario'
import ModalNuevoUsuario from '../components/ModalNuevoUsuario'
import ModalStock from '../components/ModalStock'
import { useAuth } from '../context/AuthContext'
import { mensajeDeError } from '../services/api'
import { listarInventario } from '../services/inventario'
import { eliminarUsuarioAdmin, esCuentaPrincipal, obtenerUsuarios } from '../services/usuarios'
import { ENTREGAS_VENTA, ESTADOS_VENTA, cambiarEstadoVenta, obtenerTodasLasVentas } from '../services/ventas'
import { textoDireccion } from '../utils/direccion'
import { imagenDe } from '../utils/imagen'
import { ROLES, colorRol } from '../utils/roles'
import { leer } from '../utils/storage'
import { formatearPrecio } from '../utils/formato'

// soloAdmin: secciones que el vendedor no ve (el vendedor solo revisa pedidos y productos)
const SECCIONES = [
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'bi-box-seam' },
  { id: 'usuarios', etiqueta: 'Usuarios', icono: 'bi-people', soloAdmin: true },
  { id: 'stock', etiqueta: 'Inventario', icono: 'bi-bricks' },
  { id: 'ventas', etiqueta: 'Ventas', icono: 'bi-graph-up-arrow', soloAdmin: true },
]
const PEDIDOS_EJEMPLO = [
  { id: 101, cliente: 'Juan Pérez', tipoPago: 'WebPay (Debito)', tipoEntrega: 'Despacho a Domicilio', total: 49990, estado: 'Pendiente' },
  { id: 102, cliente: 'María González', tipoPago: 'Transferencia', tipoEntrega: 'Retiro en Tienda', total: 15600, estado: 'Entregado' },
]
const VENTAS_EJEMPLO = [
  { id: 501, fecha: '11/09/2026', categoria: 'Herramientas', monto: 49990, medioPago: 'Débito' },
  { id: 502, fecha: '10/09/2026', categoria: 'Construccion', monto: 15600, medioPago: 'Crédito' },
]
const SIGUIENTES_ESTADOS = {
  PENDIENTE: ['PAGADA', 'ANULADA'],
  PAGADA: ['DESPACHADA', 'ANULADA'],
  DESPACHADA: ['ENTREGADA'],
}

function fechaCorta(fechaIso) {
  const [anio, mes, dia] = String(fechaIso).slice(0, 10).split('-')
  return `${dia}/${mes}/${anio}`
}

function pedidoDesdeVenta(v) {
  return {
    id: v.id,
    cliente: `Usuario #${v.usuarioId}`,
    tipoPago: '—',
    tipoEntrega: ENTREGAS_VENTA[v.tipoEntrega] ?? v.tipoEntrega,
    direccionTexto: v.direccionDespacho,
    subtotal: v.subtotal,
    costoDespacho: v.costoDespacho,
    total: v.total,
    estado: ESTADOS_VENTA[v.estado] ?? v.estado,
    estadoCodigo: v.estado,
    items: v.detalles.map((d) => ({ nombre: d.nombreProducto, cantidad: d.cantidad, precio: d.precioUnitario })),
  }
}

function useVentasBackend() {
  const { usuario } = useAuth()
  const conBackend = Boolean(usuario?.token)
  const [ventas, setVentas] = useState(null)
  const [error, setError] = useState(null)

  const cargar = () =>
    obtenerTodasLasVentas()
      .then((datos) => {
        setVentas(datos)
        setError(null)
      })
      .catch((e) => setError(mensajeDeError(e)))

  useEffect(() => {
    if (conBackend) cargar()
  }, [conBackend])

  return { conBackend, ventas, error, cargar }
}

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
  const { esAdmin } = useAuth()
  const { conBackend, ventas, error, cargar } = useVentasBackend()
  const [pedidosLocales] = useState(() => leer('pedidos', PEDIDOS_EJEMPLO))
  const [detalle, setDetalle] = useState(null)
  const [aviso, setAviso] = useState(null)

  const pedidos = conBackend ? (ventas ?? []).map(pedidoDesdeVenta) : pedidosLocales
  const puedeCambiarEstado = conBackend && esAdmin
  const columnas = ['ID', 'Cliente', 'Tipo Pago', 'Entrega', 'Total', 'Estado', 'Detalle']
  if (puedeCambiarEstado) columnas.push('Cambiar estado')

  const cambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoVenta(id, estado)
      setAviso({ tipo: 'success', texto: `Pedido #PED-${id} actualizado a ${ESTADOS_VENTA[estado]}.` })
      cargar()
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeDeError(e) })
    }
  }

  return (
    <>
      {error && <div className="alert alert-danger" role="alert">No se pudieron cargar los pedidos: {error}</div>}
      {aviso && (
        <div className={`alert alert-${aviso.tipo} alert-dismissible`} role={aviso.tipo === 'danger' ? 'alert' : 'status'}>
          {aviso.texto}
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)}></button>
        </div>
      )}
      <Tabla titulo="Pedidos del Mes" columnas={columnas}>
        {pedidos.map((p) => (
          <tr key={p.id}>
            <td data-label="ID">#PED-{p.id}</td>
            <td data-label="Cliente">{p.cliente}</td>
            <td data-label="Tipo Pago"><span className="badge bg-warning text-dark">{p.tipoPago}</span></td>
            <td data-label="Entrega">{p.tipoEntrega}</td>
            <td data-label="Total">{formatearPrecio(p.total)}</td>
            <td data-label="Estado"><span className="badge bg-info text-dark">{p.estado}</span></td>
            <td data-label="Detalle">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                aria-label={`Ver detalle del pedido #PED-${p.id}`}
                onClick={() => setDetalle(p)}
              >
                <i className="bi bi-eye"></i> Ver
              </button>
            </td>
            {puedeCambiarEstado && (
              <td data-label="Cambiar estado">
                {(SIGUIENTES_ESTADOS[p.estadoCodigo] ?? []).length === 0 ? (
                  <span className="text-muted">—</span>
                ) : (
                  <select
                    className="form-select form-select-sm"
                    aria-label={`Cambiar estado del pedido #PED-${p.id}`}
                    value=""
                    onChange={(e) => cambiarEstado(p.id, e.target.value)}
                  >
                    <option value="">Elegir...</option>
                    {SIGUIENTES_ESTADOS[p.estadoCodigo].map((estado) => (
                      <option key={estado} value={estado}>{ESTADOS_VENTA[estado]}</option>
                    ))}
                  </select>
                )}
              </td>
            )}
          </tr>
        ))}
      </Tabla>
      {detalle && <DetallePedido pedido={detalle} onCerrar={() => setDetalle(null)} />}
    </>
  )
}

function DetallePedido({ pedido, onCerrar }) {
  const items = pedido.items ?? []
  const filas = [
    ['Cliente', pedido.cliente],
    ['Correo', pedido.email],
    ['Entrega', pedido.tipoEntrega],
    ['Dirección', pedido.direccionTexto ?? (pedido.direccionEntrega ? textoDireccion(pedido.direccionEntrega) : null)],
    ['Tipo de pago', pedido.tipoPago],
    ['Estado', pedido.estado],
    ['Subtotal', pedido.subtotal !== undefined ? formatearPrecio(pedido.subtotal) : null],
    ['Despacho', pedido.costoDespacho ? formatearPrecio(pedido.costoDespacho) : null],
    ['Total', formatearPrecio(pedido.total)],
  ]

  return (
    <ModalDetalle titulo={`Pedido #PED-${pedido.id}`} filas={filas} onCerrar={onCerrar}>
      <h3 className="h6 fw-bold mt-3">Productos</h3>
      {items.length === 0 ? (
        <p className="text-muted small mb-0">Este pedido no tiene el detalle de productos guardado.</p>
      ) : (
        <ul className="list-group list-group-flush small">
          {items.map((item) => (
            <li key={item.nombre} className="list-group-item d-flex justify-content-between px-0">
              <span>{item.cantidad} x {item.nombre}</span>
              <span>{formatearPrecio(item.precio * item.cantidad)}</span>
            </li>
          ))}
        </ul>
      )}
    </ModalDetalle>
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
          const esPrincipal = esCuentaPrincipal(u)
          // los datos del cliente los cambia el cliente; la cuenta principal solo la toca su dueño
          const puedeEditar = u.rol !== ROLES.CLIENTE && (!esPrincipal || esPropia)
          const puedeEliminar = !esPropia && !esPrincipal
          return (
            <tr key={u.rut}>
              <td data-label="RUT">{u.rut}</td>
              <td data-label="Nombre">
                {u.nombre}
                {esPrincipal && <span className="badge bg-dark ms-2">Principal</span>}
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
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {puedeEditar && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        aria-label={`Editar a ${u.nombre}`}
                        onClick={() => setEditando(u)}
                      >
                        <i className="bi bi-pencil"></i> Editar
                      </button>
                    )}
                    {puedeEliminar && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        aria-label={`Eliminar a ${u.nombre}`}
                        onClick={() => setPorEliminar(u.rut)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    )}
                    {!puedeEditar && !puedeEliminar && <span className="text-muted small">Sin acciones</span>}
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
  const { esAdmin } = useAuth()
  const [productos, setProductos] = useState([])
  const [soloBajo, setSoloBajo] = useState(false)
  const [detalle, setDetalle] = useState(null)
  // { producto, modo: 'reponer' | 'ajustar' } mientras el admin mueve stock
  const [movimiento, setMovimiento] = useState(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    listarInventario().then(setProductos)
  }, [])

  const visibles = soloBajo ? productos.filter((p) => p.stockBajo) : productos
  const cantidadBajo = productos.filter((p) => p.stockBajo).length

  const alGuardar = (actualizado, texto) => {
    setProductos(productos.map((p) => (p.id === actualizado.id ? actualizado : p)))
    setMovimiento(null)
    setAviso(`${texto} de ${actualizado.nombre}. Stock actual: ${actualizado.stock}.`)
  }

  return (
    <>
      {aviso && (
        <div className="alert alert-success alert-dismissible" role="status">
          {aviso}
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)}></button>
        </div>
      )}
      <Tabla
        titulo="Inventario"
        columnas={['ID', 'Producto', 'Categoría', 'Stock', 'Stock mínimo', 'Estado', 'Acciones']}
        filtros={
          <div className="form-check mb-3">
            <input
              id="filtro-stock-bajo"
              type="checkbox"
              className="form-check-input"
              checked={soloBajo}
              onChange={(e) => setSoloBajo(e.target.checked)}
            />
            <label htmlFor="filtro-stock-bajo" className="form-check-label">
              Ver solo productos con stock bajo ({cantidadBajo})
            </label>
          </div>
        }
      >
        {visibles.length === 0 && (
          <tr>
            <td colSpan="7" className="text-center text-muted">
              {soloBajo ? 'No hay productos con stock bajo.' : 'No hay productos en inventario.'}
            </td>
          </tr>
        )}
        {visibles.map((p) => {
          let estado = <span className="badge bg-success">Disponible</span>
          if (p.stock === 0) estado = <span className="badge bg-danger">Agotado</span>
          else if (p.stockBajo) estado = <span className="badge bg-warning text-dark">Stock bajo</span>

          return (
            <tr key={p.id}>
              <td data-label="ID">{p.id}</td>
              <td data-label="Producto">{p.nombre}</td>
              <td data-label="Categoría">{p.categoria || 'General'}</td>
              <td data-label="Stock">{p.stock}</td>
              <td data-label="Stock mínimo">{p.stockMinimo}</td>
              <td data-label="Estado">{estado}</td>
              <td data-label="Acciones">
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    aria-label={`Ver detalle de ${p.nombre}`}
                    onClick={() => setDetalle(p)}
                  >
                    <i className="bi bi-eye"></i> Ver
                  </button>
                  {/* mover stock es solo del admin; el vendedor solo visualiza */}
                  {esAdmin && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        aria-label={`Reponer stock de ${p.nombre}`}
                        onClick={() => setMovimiento({ producto: p, modo: 'reponer' })}
                      >
                        <i className="bi bi-plus-circle"></i> Reponer
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        aria-label={`Ajustar stock de ${p.nombre}`}
                        onClick={() => setMovimiento({ producto: p, modo: 'ajustar' })}
                      >
                        <i className="bi bi-sliders"></i> Ajustar
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </Tabla>
      {detalle && <DetalleProducto producto={detalle} onCerrar={() => setDetalle(null)} />}
      {movimiento && (
        <ModalStock
          key={`${movimiento.modo}-${movimiento.producto.id}`}
          producto={movimiento.producto}
          modo={movimiento.modo}
          onCerrar={() => setMovimiento(null)}
          onGuardado={alGuardar}
        />
      )}
    </>
  )
}

function DetalleProducto({ producto, onCerrar }) {
  const filas = [
    ['Descripción', producto.descripcion],
    ['Categoría', producto.categoria || 'General'],
    ['Marca', producto.marca],
    ['Precio', formatearPrecio(producto.precio)],
    ['Precio de compra', producto.precioCompra != null ? formatearPrecio(producto.precioCompra) : null],
    ['Margen', producto.margen != null ? formatearPrecio(producto.margen) : null],
    ['Stock', producto.stock],
    ['Stock mínimo', producto.stockMinimo],
  ]

  return (
    <ModalDetalle titulo={producto.nombre} filas={filas} onCerrar={onCerrar}>
      <img src={imagenDe(producto)} alt={producto.nombre} className="img-fluid rounded border mt-2" style={{ maxHeight: 180 }} />
    </ModalDetalle>
  )
}

function SeccionVentas() {
  const { conBackend, ventas: ventasBackend, error } = useVentasBackend()
  const [ventasLocales] = useState(() => leer('ventas', VENTAS_EJEMPLO))
  const ventas = conBackend
    ? (ventasBackend ?? [])
        .filter((v) => v.estado !== 'ANULADA')
        .map((v) => ({
          id: v.id,
          fecha: fechaCorta(v.fecha),
          categoria: v.detalles.map((d) => `${d.cantidad} x ${d.nombreProducto}`).join(', '),
          monto: v.total,
          medioPago: '—',
        }))
    : ventasLocales
  const [anio, setAnio] = useState('')
  const [mes, setMes] = useState('')

  const visibles = ventas.filter((v) => {
    const f = partesFecha(v.fecha)
    return (anio === '' || f.anio === anio) && (mes === '' || f.mes === mes)
  })

  return (
    <>
    {error && <div className="alert alert-danger" role="alert">No se pudieron cargar las ventas: {error}</div>}
    <Tabla
      titulo="Histórico de Ventas"
      columnas={['N° Venta', 'Fecha', conBackend ? 'Productos' : 'Categoría', 'Monto', 'Medio Pago']}
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
              <option value="12">Diciembre</option>
              <option value="11">Noviembre</option>
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
          <td data-label={conBackend ? 'Productos' : 'Categoría'}>{v.categoria}</td>
          <td data-label="Monto">{formatearPrecio(v.monto)}</td>
          <td data-label="Medio Pago">{v.medioPago}</td>
        </tr>
      ))}
    </Tabla>
    </>
  )
}

const VISTAS = {
  pedidos: SeccionPedidos,
  usuarios: SeccionUsuarios,
  stock: SeccionStock,
  ventas: SeccionVentas,
}

function Admin() {
  const { esAdmin } = useAuth()
  useTitulo(`${esAdmin ? 'Panel de Administración' : 'Panel de Vendedor'} - Ferretería Los Maestros`)
  const secciones = SECCIONES.filter((s) => esAdmin || !s.soloAdmin)
  const [seccion, setSeccion] = useState('pedidos')
  const Vista = VISTAS[secciones.some((s) => s.id === seccion) ? seccion : 'pedidos']

  return (
    <main className="container-fluid pt-3">
      <div className="row g-3">
        <aside className="col-12 col-md-3 col-lg-2">
          <div className="bg-white p-3 rounded border shadow-sm sticky-md-top" style={{ top: 90 }}>
            <h2 className="h6 fw-bold mb-3 border-bottom pb-2">{esAdmin ? 'Panel Admin' : 'Panel Vendedor'}</h2>
            <nav className="d-grid gap-2">
              {secciones.map(({ id, etiqueta, icono }) => (
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
