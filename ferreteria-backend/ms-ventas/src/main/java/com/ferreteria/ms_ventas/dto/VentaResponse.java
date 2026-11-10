package com.ferreteria.ms_ventas.dto;

import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.TipoEntrega;
import com.ferreteria.ms_ventas.model.Venta;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaResponse {

    private Long id;
    private Long usuarioId;
    private LocalDateTime fecha;
    private EstadoVenta estado;
    private TipoEntrega tipoEntrega;
    private String direccionDespacho;
    private Long total;
    private List<DetalleVentaResponse> detalles;

    public static VentaResponse desde(Venta venta) {
        return new VentaResponse(
                venta.getId(),
                venta.getUsuarioId(),
                venta.getFecha(),
                venta.getEstado(),
                venta.getTipoEntrega(),
                venta.getDireccionDespacho(),
                venta.getTotal(),
                venta.getDetalles().stream()
                        .map(DetalleVentaResponse::desde)
                        .toList());
    }
}
