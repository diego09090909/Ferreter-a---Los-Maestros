package com.ferreteria.ms_usuarios.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminInicial implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.password:Admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        String email = "admin@losmaestros.cl";
        String rut = "11111111-1";

        // Si ya existe, no hace nada (así no se duplica en cada arranque)
        if (usuarioRepository.existsByEmail(email) || usuarioRepository.existsByRut(rut)) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre("Administrador General");
        admin.setRut(rut);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRol(Rol.ADMIN);

        usuarioRepository.save(admin);
    }
}