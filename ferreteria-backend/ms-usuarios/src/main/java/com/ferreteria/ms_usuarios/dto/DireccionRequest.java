package com.ferreteria.ms_usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRequest {

    @Size(max = 50, message = "El alias no puede superar los 50 caracteres")
    private String alias;

    @NotBlank(message = "La calle es obligatoria")
    @Size(max = 150, message = "La calle no puede superar los 150 caracteres")
    private String calle;

    @NotBlank(message = "El numero es obligatorio")
    @Size(max = 20, message = "El numero no puede superar los 20 caracteres")
    private String numero;

    @Size(max = 20, message = "El departamento no puede superar los 20 caracteres")
    private String departamento;

    @NotBlank(message = "Debe elegir una comuna")
    private String comuna;

    private String region;

    @Size(max = 300, message = "Las indicaciones no pueden superar los 300 caracteres")
    private String indicaciones;
}