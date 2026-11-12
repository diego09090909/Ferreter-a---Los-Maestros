package com.ferreteria.ms_usuarios.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.PerfilRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/{id}")
    public UsuarioResponse obtenerPerfil(@PathVariable Long id) {
        return usuarioService.obtenerPerfil(id);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizarPerfil(@PathVariable Long id,
                                            @Valid @RequestBody PerfilRequest req) {
        return usuarioService.actualizarPerfil(id, req);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> cambiarPassword(@PathVariable Long id,
                                                @Valid @RequestBody CambiarPasswordRequest req) {
        usuarioService.actualizarContrasena(id, req);
        return ResponseEntity.noContent().build();
    }
}