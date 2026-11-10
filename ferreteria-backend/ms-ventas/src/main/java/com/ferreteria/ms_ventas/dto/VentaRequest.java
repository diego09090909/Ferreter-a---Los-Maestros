package com.ferreteria.ms_ventas.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ferreteria.ms_ventas.model.TipoEntrega;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaRequest {

    @NotEmpty(message = "El carrito está vacío")
    @Size(max = 50, message = "No puede comprar más de 50 productos distintos en una venta")
    private List<@Valid ItemVentaRequest> items;

    @NotNull(message = "Debe elegir retiro en tienda o despacho a domicilio")
    private TipoEntrega tipoEntrega;

    @Size(max = 300, message = "La dirección no puede tener más de 300 caracteres")
    private String direccionDespacho;

    @JsonIgnore
    @AssertTrue(message = "Debe ingresar una dirección para el despacho")
    public boolean isDireccionValidaParaDespacho() {
        if (tipoEntrega != TipoEntrega.DESPACHO_A_DOMICILIO) {
            return true;
        }
        return direccionDespacho != null && !direccionDespacho.isBlank();
    }
}
