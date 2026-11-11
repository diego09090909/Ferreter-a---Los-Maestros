package com.ferreteria.ms_catalogo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoRequest {

    @NotBlank(message = "El codigo es obligatorio")
    @Pattern(regexp = "^[A-Z]{2}\\d{3}$", message = "El codigo debe tener 2 letras mayusculas y 3 numeros (ej: MC001)")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede tener mas de 100 caracteres")
    private String nombre;

    @Size(max = 500, message = "La descripcion no puede tener mas de 500 caracteres")
    private String descripcion;

    @NotBlank(message = "La subcategoria es obligatoria")
    @Size(max = 50, message = "La subcategoria no puede tener mas de 50 caracteres")
    private String subcategoria;

    @Size(max = 50, message = "La marca no puede tener mas de 50 caracteres")
    private String marca;

    @NotBlank(message = "La unidad es obligatoria (ej: Unidad, Saco, Galon)")
    @Size(max = 30, message = "La unidad no puede tener mas de 30 caracteres")
    private String unidad;

    @NotNull(message = "El precio de compra es obligatorio")
    @Min(value = 1, message = "El precio de compra debe ser mayor a 0")
    private Integer precioCompra;

    @NotNull(message = "El precio de venta es obligatorio")
    @Min(value = 1, message = "El precio de venta debe ser mayor a 0")
    private Integer precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @NotNull(message = "El stock minimo es obligatorio")
    @Min(value = 0, message = "El stock minimo no puede ser negativo")
    private Integer stockMinimo;

    @Size(max = 255)
    private String imagen;

    @NotNull(message = "Debe elegir una categoria")
    private Long categoriaId;
}