package com.ferreteria.ms_catalogo.dto;

import com.ferreteria.ms_catalogo.model.Producto;
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

    public static ProductoResponse desde(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getCodigo(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getSubcategoria(),
                producto.getMarca(),
                producto.getUnidad(),
                producto.getPrecio(),
                producto.getStock(),
                producto.getStock() > 0,
                producto.getImagen(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getCategoria().getEtiqueta());
    }
}