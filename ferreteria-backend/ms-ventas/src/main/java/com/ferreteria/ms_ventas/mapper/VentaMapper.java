package com.ferreteria.ms_ventas.mapper;

import com.ferreteria.ms_ventas.client.ProductoCatalogo;
import com.ferreteria.ms_ventas.dto.DetalleVentaResponse;
import com.ferreteria.ms_ventas.dto.VentaResponse;
import com.ferreteria.ms_ventas.model.DetalleVenta;
import com.ferreteria.ms_ventas.model.Venta;
import org.springframework.stereotype.Component;

@Component
public class VentaMapper {
    public VentaResponse aResponse(Venta venta) {
        return new VentaResponse(
                venta.getId(),
                venta.getUsuarioId(),
                venta.getFecha(),
                venta.getEstado(),
                venta.getTipoEntrega(),
                venta.getDireccionDespacho(),
                venta.getComunaDespacho(),
                venta.getSubtotal(),
                venta.getCostoDespacho(),
                venta.getTotal(),
                venta.getDetalles().stream().map(this::aDetalleResponse).toList());
    }

    public DetalleVentaResponse aDetalleResponse(DetalleVenta detalle) {
        return new DetalleVentaResponse(
                detalle.getId(),
                detalle.getProductoId(),
                detalle.getNombreProducto(),
                detalle.getPrecioUnitario(),
                detalle.getCantidad(),
                detalle.getSubtotal());
    }

    public DetalleVenta aDetalle(ProductoCatalogo producto, int cantidad) {
        DetalleVenta detalle = new DetalleVenta();
        detalle.setProductoId(producto.getId());
        detalle.setNombreProducto(producto.getNombre());
        detalle.setPrecioUnitario(producto.getPrecio());
        detalle.setCantidad(cantidad);
        detalle.setSubtotal((long) producto.getPrecio() * cantidad);
        return detalle;
    }
}
