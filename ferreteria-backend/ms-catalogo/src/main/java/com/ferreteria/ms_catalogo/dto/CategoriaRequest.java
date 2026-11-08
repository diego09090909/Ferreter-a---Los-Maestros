package com.ferreteria.ms_catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 50, message = "El nombre no puede tener mas de 50 caracteres")
    private String nombre;

    @NotBlank(message = "La etiqueta es obligatoria")
    @Size(max = 50, message = "La etiqueta no puede tener mas de 50 caracteres")
    private String etiqueta;

    @Size(max = 200, message = "La descripcion no puede tener mas de 200 caracteres")
    private String descripcion;
}