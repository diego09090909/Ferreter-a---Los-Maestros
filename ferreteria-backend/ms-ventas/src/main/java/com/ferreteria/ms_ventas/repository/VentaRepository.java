package com.ferreteria.ms_ventas.repository;

import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.Venta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    // Spring genera el SQL a partir del nombre del método (query methods).
    // @EntityGraph trae los detalles en la misma consulta (evita el problema N+1).

    @EntityGraph(attributePaths = "detalles")
    List<Venta> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    @EntityGraph(attributePaths = "detalles")
    List<Venta> findByEstadoOrderByFechaDesc(EstadoVenta estado);

    @EntityGraph(attributePaths = "detalles")
    List<Venta> findAllByOrderByFechaDesc();

    @EntityGraph(attributePaths = "detalles")
    Optional<Venta> findWithDetallesById(Long id);
}
