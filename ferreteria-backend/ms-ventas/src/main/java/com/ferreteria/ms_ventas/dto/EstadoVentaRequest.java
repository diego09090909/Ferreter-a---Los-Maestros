package com.ferreteria.ms_ventas.dto;

import com.ferreteria.ms_ventas.model.EstadoVenta;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoVentaRequest {

    @NotNull(message = "Debe indicar el nuevo estado (PENDIENTE, PAGADA, DESPACHADA, ENTREGADA o ANULADA)")
    private EstadoVenta estado;
}
