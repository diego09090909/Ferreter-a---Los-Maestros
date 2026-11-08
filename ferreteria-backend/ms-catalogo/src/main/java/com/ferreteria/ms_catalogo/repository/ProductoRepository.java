package com.ferreteria.ms_catalogo.repository;

import com.ferreteria.ms_catalogo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaNombre(String nombreCategoria);

    List<Producto> findByNombreContainingIgnoreCase(String texto);

    List<Producto> findByCategoriaNombreAndNombreContainingIgnoreCase(String nombreCategoria, String texto);

    List<Producto> findByStockBodegaLessThan(Integer cantidad);

    boolean existsByCategoriaId(Long categoriaId);
}