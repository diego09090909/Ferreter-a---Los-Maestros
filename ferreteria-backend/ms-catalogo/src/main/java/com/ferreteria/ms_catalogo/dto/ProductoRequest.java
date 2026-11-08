package com.ferreteria.ms_catalogo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede tener mas de 100 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripcion no puede tener mas de 500 caracteres")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 1, message = "El precio debe ser mayor a 0")
    private Integer precio;

    @Size(max = 50, message = "La marca no puede tener mas de 50 caracteres")
    private String marca;

    @NotNull(message = "El stock de tienda es obligatorio")
    @Min(value = 0, message = "El stock de tienda no puede ser negativo")
    private Integer stockTienda;

    @NotNull(message = "El stock de bodega es obligatorio")
    @Min(value = 0, message = "El stock de bodega no puede ser negativo")
    private Integer stockBodega;

    @Size(max = 255)
    private String imagen;

    @NotNull(message = "Debe elegir una categoria")
    private Long categoriaId;
}