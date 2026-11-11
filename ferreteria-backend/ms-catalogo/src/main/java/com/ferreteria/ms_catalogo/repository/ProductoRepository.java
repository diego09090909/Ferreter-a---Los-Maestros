package com.ferreteria.ms_catalogo.repository;

import com.ferreteria.ms_catalogo.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, Long id);

    List<Producto> findByCategoriaNombre(String nombreCategoria);

    List<Producto> findByNombreContainingIgnoreCase(String texto);

    List<Producto> findByCategoriaNombreAndNombreContainingIgnoreCase(String nombreCategoria, String texto);

    // productos que llegaron a su stock minimo o menos (para reponer)
    @Query("SELECT p FROM Producto p WHERE p.stock <= p.stockMinimo ORDER BY p.stock ASC")
    List<Producto> buscarStockBajo();

    boolean existsByCategoriaId(Long categoriaId);
}