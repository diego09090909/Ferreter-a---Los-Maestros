package com.ferreteria.ms_catalogo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String subcategoria;
    private String marca;
    private String unidad;
    private Integer precio;
    private Integer stock;
    private Boolean disponible;
    private String imagen;
    private Long categoriaId;
    private String categoria;
    private String categoriaEtiqueta;
}