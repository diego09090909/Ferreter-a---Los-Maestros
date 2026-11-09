package com.ferreteria.ms_ventas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemVentaRequest {

    @NotNull(message = "Debe indicar el producto")
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @Max(value = 1_000, message = "No puede comprar más de 1.000 unidades de un mismo producto")
    private Integer cantidad;
}
