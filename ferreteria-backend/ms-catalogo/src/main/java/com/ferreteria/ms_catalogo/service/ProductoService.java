package com.ferreteria.ms_catalogo.service;

import com.ferreteria.ms_catalogo.dto.ProductoAdminResponse;
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
        return filtrar(categoria, buscar).stream().map(ProductoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse buscarPorId(Long id) {
        return ProductoResponse.desde(obtener(id));
    }

    @Transactional(readOnly = true)
    public List<ProductoAdminResponse> listarParaAdmin(String categoria, String buscar) {
        return filtrar(categoria, buscar).stream().map(ProductoAdminResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public ProductoAdminResponse buscarPorIdParaAdmin(Long id) {
        return ProductoAdminResponse.desde(obtener(id));
    }

    @Transactional(readOnly = true)
    public List<ProductoAdminResponse> stockBajo() {
        return productoRepository.buscarStockBajo().stream().map(ProductoAdminResponse::desde).toList();
    }

    @Transactional
    public ProductoAdminResponse crear(ProductoRequest request) {
        String codigo = request.getCodigo().trim().toUpperCase();
        if (productoRepository.existsByCodigo(codigo)) {
            throw new ReglaNegocioException("Ya existe un producto con el codigo " + codigo);
        }
        validarPrecios(request);

        Producto producto = new Producto();
        copiarDatos(request, producto);
        return ProductoAdminResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public ProductoAdminResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = obtener(id);
        String codigo = request.getCodigo().trim().toUpperCase();
        if (productoRepository.existsByCodigoAndIdNot(codigo, id)) {
            throw new ReglaNegocioException("Ya existe otro producto con el codigo " + codigo);
        }
        validarPrecios(request);

        copiarDatos(request, producto);
        return ProductoAdminResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        productoRepository.delete(obtener(id));
    }

    @Transactional
    public ProductoResponse descontarStock(Long id, Integer cantidad) {
        Producto producto = obtener(id);

        if (cantidad > producto.getStock()) {
            throw new ReglaNegocioException("Stock insuficiente para " + producto.getNombre()
                    + ": se pidieron " + cantidad + " y hay " + producto.getStock());
        }

        producto.setStock(producto.getStock() - cantidad);
        return ProductoResponse.desde(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse reponerStock(Long id, Integer cantidad) {
        Producto producto = obtener(id);
        producto.setStock(producto.getStock() + cantidad);
        return ProductoResponse.desde(productoRepository.save(producto));
    }

    private List<Producto> filtrar(String categoria, String buscar) {
        boolean conCategoria = categoria != null && !categoria.isBlank();
        boolean conTexto = buscar != null && !buscar.isBlank();

        if (conCategoria && conTexto) {
            return productoRepository.findByCategoriaNombreAndNombreContainingIgnoreCase(categoria, buscar.trim());
        }
        if (conCategoria) {
            return productoRepository.findByCategoriaNombre(categoria);
        }
        if (conTexto) {
            return productoRepository.findByNombreContainingIgnoreCase(buscar.trim());
        }
        return productoRepository.findAll();
    }

    private void validarPrecios(ProductoRequest request) {
        if (request.getPrecio() <= request.getPrecioCompra()) {
            throw new ReglaNegocioException("El precio de venta debe ser mayor al precio de compra");
        }
    }

    private Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el producto con id " + id));
    }

    private void copiarDatos(ProductoRequest request, Producto producto) {
        producto.setCodigo(request.getCodigo().trim().toUpperCase());
        producto.setNombre(request.getNombre().trim());
        producto.setDescripcion(request.getDescripcion());
        producto.setSubcategoria(request.getSubcategoria().trim());
        producto.setMarca(request.getMarca());
        producto.setUnidad(request.getUnidad().trim());
        producto.setPrecioCompra(request.getPrecioCompra());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setImagen(request.getImagen());
        producto.setCategoria(categoriaService.obtener(request.getCategoriaId()));
    }
}