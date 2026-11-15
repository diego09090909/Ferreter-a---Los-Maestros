import api from './api'
import { ENTREGA_DOMICILIO, idProductoDe } from '../utils/carrito'
import { textoDireccion } from '../utils/direccion'

export const ESTADOS_VENTA = {
  PENDIENTE: 'Pendiente',
  PAGADA: 'Pagada',
  DESPACHADA: 'Despachada',
  ENTREGADA: 'Entregada',
  ANULADA: 'Anulada',
}

export const MEDIOS_PAGO = {
  DEBITO: 'Débito',
  CREDITO: 'Crédito',
  CUENTA_CORRIENTE: 'Cuenta Corriente',
}

export const ENTREGAS_VENTA = {
  RETIRO_EN_TIENDA: 'Retiro en tienda',
  DESPACHO_A_DOMICILIO: 'Despacho a domicilio',
}

export function armarVentaRequest({ carrito, entrega, direccion, pago, cliente }) {
  const conDespacho = entrega === ENTREGA_DOMICILIO

  const venta = {
    items: carrito.map((item) => ({
      productoId: idProductoDe(item.codigo),
      cantidad: item.cantidad,
    })),
    tipoEntrega: conDespacho ? 'DESPACHO_A_DOMICILIO' : 'RETIRO_EN_TIENDA',
    medioPago: Object.keys(MEDIOS_PAGO).find((codigo) => MEDIOS_PAGO[codigo] === pago),
    nombreCliente: cliente?.nombre.trim(),
    emailCliente: cliente?.email.trim(),
  }

  if (conDespacho) {
    venta.direccionDespacho = textoDireccion(direccion)
    venta.comunaDespacho = direccion.comuna
  }
  return venta
}

export async function crearVenta(venta) {
  const { data } = await api.post('/api/v1/ventas', venta)
  return data
}

export async function obtenerMisVentas() {
  const { data } = await api.get('/api/v1/ventas/mis-ventas')
  return data
}

export async function obtenerTodasLasVentas(estado) {
  const { data } = await api.get('/api/v1/ventas', { params: estado ? { estado } : {} })
  return data
}

export async function cambiarEstadoVenta(ventaId, estado) {
  const { data } = await api.patch(`/api/v1/ventas/${ventaId}/estado`, { estado })
  return data
}
