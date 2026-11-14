package com.ferreteria.ms_ventas.dto;

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
}
