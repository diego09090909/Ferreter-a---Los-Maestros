package com.ferreteria.ms_ventas.dto;

import com.ferreteria.ms_ventas.model.DetalleVenta;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVentaResponse {

    private Long id;
    private Long productoId;
    private String nombreProducto;
    private Integer precioUnitario;
    private Integer cantidad;
    private Long subtotal;

    public static DetalleVentaResponse desde(DetalleVenta detalle) {
        return new DetalleVentaResponse(
                detalle.getId(),
                detalle.getProductoId(),
                detalle.getNombreProducto(),
                detalle.getPrecioUnitario(),
                detalle.getCantidad(),
                detalle.getSubtotal());
    }
}
