package com.ferreteria.ms_usuarios.repository;

import com.ferreteria.ms_usuarios.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByRut(String rut);

    Optional<Usuario> findByEmailOrRut(String email, String rut);

    boolean existsByEmail(String email);

    boolean existsByRut(String rut);

    long countByRolNombre(String nombreRol);
}