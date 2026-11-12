package com.ferreteria.ms_catalogo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoAdminResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private String subcategoria;
    private String marca;
    private String unidad;
    private Integer precioCompra;
    private Integer precio;
    private Integer margen;
    private Integer stock;
    private Integer stockMinimo;
    private Boolean stockBajo;
    private String imagen;
    private Long categoriaId;
    private String categoria;
}