package com.ferreteria.ms_ventas.repository;

import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.Venta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    @EntityGraph(attributePaths = "detalles")
    List<Venta> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    @EntityGraph(attributePaths = "detalles")
    List<Venta> findByEstadoOrderByFechaDesc(EstadoVenta estado);

    @EntityGraph(attributePaths = "detalles")
    List<Venta> findAllByOrderByFechaDesc();

    @EntityGraph(attributePaths = "detalles")
    Optional<Venta> findWithDetallesById(Long id);
}
