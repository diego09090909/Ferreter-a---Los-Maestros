package com.ferreteria.ms_catalogo.dto;

import com.ferreteria.ms_catalogo.model.Producto;
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

    public static ProductoAdminResponse desde(Producto producto) {
        return new ProductoAdminResponse(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getSubcategoria(),
                producto.getMarca(),
                producto.getUnidad(),
                producto.getPrecioCompra(),
                producto.getPrecio(),
                producto.getPrecio() - producto.getPrecioCompra(),
                producto.getStock(),
                producto.getStockMinimo(),
                producto.getStock() <= producto.getStockMinimo(),
                producto.getImagen(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre());
    }
}