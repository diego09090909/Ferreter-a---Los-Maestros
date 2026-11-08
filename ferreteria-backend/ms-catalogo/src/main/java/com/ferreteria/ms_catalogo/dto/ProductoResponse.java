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
    private String nombre;
    private String descripcion;
    private Integer precio;
    private String marca;
    private Integer stockTienda;
    private Integer stockBodega;
    private Integer stockTotal;
    private String imagen;
    private Long categoriaId;
    private String categoria;
    private String categoriaEtiqueta;

    public static ProductoResponse desde(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio(),
                producto.getMarca(),
                producto.getStockTienda(),
                producto.getStockBodega(),
                producto.getStockTienda() + producto.getStockBodega(),
                producto.getImagen(),
                producto.getCategoria().getId(),
                producto.getCategoria().getNombre(),
                producto.getCategoria().getEtiqueta());
    }
}