package com.ferreteria.ms_catalogo.service;

import com.ferreteria.ms_catalogo.dto.CategoriaRequest;
import com.ferreteria.ms_catalogo.dto.CategoriaResponse;
import com.ferreteria.ms_catalogo.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_catalogo.exception.ReglaNegocioException;
import com.ferreteria.ms_catalogo.model.Categoria;
import com.ferreteria.ms_catalogo.repository.CategoriaRepository;
import com.ferreteria.ms_catalogo.repository.ProductoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll().stream().map(CategoriaResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse buscarPorId(Long id) {
        return CategoriaResponse.desde(obtener(id));
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.getNombre().trim();
        if (categoriaRepository.existsByNombre(nombre)) {
            throw new ReglaNegocioException("Ya existe una categoria con el nombre " + nombre);
        }

        Categoria categoria = new Categoria();
        copiarDatos(request, categoria);
        return CategoriaResponse.desde(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = obtener(id);
        String nombre = request.getNombre().trim();
        if (categoriaRepository.existsByNombreAndIdNot(nombre, id)) {
            throw new ReglaNegocioException("Ya existe otra categoria con el nombre " + nombre);
        }

        copiarDatos(request, categoria);
        return CategoriaResponse.desde(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = obtener(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new ReglaNegocioException("No se puede eliminar la categoria porque tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }

    // lo usa ProductoService para asignar la categoria a un producto
    public Categoria obtener(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la categoria con id " + id));
    }

    private void copiarDatos(CategoriaRequest request, Categoria categoria) {
        categoria.setNombre(request.getNombre().trim());
        categoria.setEtiqueta(request.getEtiqueta().trim());
        categoria.setDescripcion(request.getDescripcion());
    }
}