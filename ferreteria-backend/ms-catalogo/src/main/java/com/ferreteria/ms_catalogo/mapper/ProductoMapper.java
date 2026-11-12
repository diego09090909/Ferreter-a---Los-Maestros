package com.ferreteria.ms_catalogo.mapper;

import com.ferreteria.ms_catalogo.dto.ProductoAdminResponse;
import com.ferreteria.ms_catalogo.dto.ProductoRequest;
import com.ferreteria.ms_catalogo.dto.ProductoResponse;
import com.ferreteria.ms_catalogo.model.Categoria;
import com.ferreteria.ms_catalogo.model.Producto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public ProductoResponse aResponse(Producto p) {
        return new ProductoResponse(
                p.getId(), p.getCodigo(), p.getNombre(), p.getDescripcion(),
                p.getSubcategoria(), p.getMarca(), p.getUnidad(),
                p.getPrecio(), p.getStock(), p.getStock() > 0, p.getImagen(),
                p.getCategoria().getId(), p.getCategoria().getNombre(), p.getCategoria().getEtiqueta());
    }

    public ProductoAdminResponse aAdminResponse(Producto p) {
        return new ProductoAdminResponse(
                p.getId(), p.getCodigo(), p.getNombre(), p.getDescripcion(),
                p.getSubcategoria(), p.getMarca(), p.getUnidad(),
                p.getPrecioCompra(), p.getPrecio(), p.getPrecio() - p.getPrecioCompra(),
                p.getStock(), p.getStockMinimo(), p.getStock() <= p.getStockMinimo(),
                p.getImagen(), p.getCategoria().getId(), p.getCategoria().getNombre());
    }

    public Producto aEntidad(ProductoRequest r, Categoria categoria) {
        Producto p = new Producto();
        actualizar(p, r, categoria);
        return p;
    }

    public void actualizar(Producto p, ProductoRequest r, Categoria categoria) {
        p.setCodigo(r.getCodigo().trim().toUpperCase());
        p.setNombre(r.getNombre().trim());
        p.setDescripcion(r.getDescripcion());
        p.setSubcategoria(r.getSubcategoria().trim());
        p.setMarca(r.getMarca());
        p.setUnidad(r.getUnidad().trim());
        p.setPrecioCompra(r.getPrecioCompra());
        p.setPrecio(r.getPrecio());
        p.setStock(r.getStock());
        p.setStockMinimo(r.getStockMinimo());
        p.setImagen(r.getImagen());
        p.setCategoria(categoria);
    }
}