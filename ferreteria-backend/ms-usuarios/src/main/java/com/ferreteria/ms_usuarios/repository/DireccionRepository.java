package com.ferreteria.ms_usuarios.repository;

import com.ferreteria.ms_usuarios.model.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {

    List<Direccion> findByUsuarioId(Long usuarioId);

    Optional<Direccion> findByIdAndUsuarioId(Long id, Long usuarioId);
}