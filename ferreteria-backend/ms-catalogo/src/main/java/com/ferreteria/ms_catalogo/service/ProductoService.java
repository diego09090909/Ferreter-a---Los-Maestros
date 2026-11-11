package com.ferreteria.ms_catalogo.service;

import com.ferreteria.ms_catalogo.dto.ProductoRequest;
import com.ferreteria.ms_catalogo.dto.ProductoResponse;
import com.ferreteria.ms_catalogo.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_catalogo.exception.ReglaNegocioException;
import com.ferreteria.ms_catalogo.model.Producto;
import com.ferreteria.ms_catalogo.repository.ProductoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaService categoriaService;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar(String categoria, String buscar) {
        boolean conCategoria = categoria != null && !categoria.isBlank();
        boolean conTexto = buscar != null && !buscar.isBlank();

        List<Producto> productos;
        if (conCategoria && conTexto) {
            productos = productoRepository.findByCategoriaNombreAndNombreContainingIgnoreCase(categoria, buscar.trim());
        } else if (conCategoria) {
            productos = productoRepository.findByCategoriaNombre(categoria);
        } else if (conTexto) {
            productos = productoRepository.findByNombreContainingIgnoreCase(buscar.trim());
        } else {
            productos = productoRepository.findAll();
        }
        return productos.stream().map(ProductoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse buscarPorId(Long id) {
        return ProductoResponse.desde(obtener(id));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> stockBajo(Integer limite) {
        return productoRepository.findByStockBodegaLessThan(limite).stream().map(ProductoResponse::desde).toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Producto producto = new Producto();
        copiarDatos(request, producto);
        return ProductoResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = obtener(id);
        copiarDatos(request, producto);
        return ProductoResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        productoRepository.delete(obtener(id));
    }

    @Transactional
    public ProductoResponse descontarStock(Long id, Integer cantidad) {
        Producto producto = obtener(id);
        int disponible = producto.getStockTienda() + producto.getStockBodega();

        if (cantidad > disponible) {
            throw new ReglaNegocioException("Stock insuficiente para " + producto.getNombre()
                    + ": se pidieron " + cantidad + " y hay " + disponible);
        }

        int desdeTienda = Math.min(producto.getStockTienda(), cantidad);
        producto.setStockTienda(producto.getStockTienda() - desdeTienda);
        producto.setStockBodega(producto.getStockBodega() - (cantidad - desdeTienda));

        return ProductoResponse.desde(productoRepository.save(producto));
    }

    private Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el producto con id " + id));
    }

    private void copiarDatos(ProductoRequest request, Producto producto) {
        producto.setNombre(request.getNombre().trim());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setMarca(request.getMarca());
        producto.setStockTienda(request.getStockTienda());
        producto.setStockBodega(request.getStockBodega());
        producto.setImagen(request.getImagen());
        producto.setCategoria(categoriaService.obtener(request.getCategoriaId()));
    }
}