package com.ferreteria.ms_ventas.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ferreteria.ms_ventas.model.TipoEntrega;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Datos para crear una venta (checkout del carrito)")
public class VentaRequest {
    @NotEmpty(message = "El carrito está vacío")
    @Size(max = 50, message = "No puede comprar más de 50 productos distintos en una venta")
    @Schema(description = "Productos y cantidades del carrito")
    private List<@Valid ItemVentaRequest> items;

    @NotNull(message = "Debe elegir retiro en tienda o despacho a domicilio")
    @Schema(example = "DESPACHO_A_DOMICILIO")
    private TipoEntrega tipoEntrega;

    @Size(max = 300, message = "La dirección no puede tener más de 300 caracteres")
    @Schema(description = "Obligatoria si tipoEntrega es DESPACHO_A_DOMICILIO",
            example = "Av. Francisco de Aguirre 123, depto 4")
    private String direccionDespacho;

    @Size(max = 50, message = "La comuna no puede tener más de 50 caracteres")
    @Schema(description = "Obligatoria si tipoEntrega es DESPACHO_A_DOMICILIO. "
            + "Con cobertura: La Serena, Coquimbo, Andacollo, Vicuña, Ovalle",
            example = "La Serena")
    private String comunaDespacho;

    @JsonIgnore
    @AssertTrue(message = "Debe ingresar una dirección para el despacho")
    public boolean isDireccionValidaParaDespacho() {
        if (tipoEntrega != TipoEntrega.DESPACHO_A_DOMICILIO) {
            return true;
        }
        return direccionDespacho != null && !direccionDespacho.isBlank();
    }

    @JsonIgnore
    @AssertTrue(message = "Debe indicar la comuna para el despacho")
    public boolean isComunaValidaParaDespacho() {
        if (tipoEntrega != TipoEntrega.DESPACHO_A_DOMICILIO) {
            return true;
        }
        return comunaDespacho != null && !comunaDespacho.isBlank();
    }
}
