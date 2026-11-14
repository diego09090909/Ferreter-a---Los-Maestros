package com.ferreteria.ms_ventas.dto;

import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.TipoEntrega;
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
    private String comunaDespacho;
    private Long subtotal;
    private Long costoDespacho;
    private Long total;
    private List<DetalleVentaResponse> detalles;
}
