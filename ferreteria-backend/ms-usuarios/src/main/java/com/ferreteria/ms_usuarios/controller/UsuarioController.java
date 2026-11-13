package com.ferreteria.ms_usuarios.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.PerfilRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios/me")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public UsuarioResponse obtenerPerfil(@AuthenticationPrincipal Long usuarioId) {
        return usuarioService.obtenerPerfil(usuarioId);
    }

    @PutMapping
    public UsuarioResponse actualizarPerfil(@AuthenticationPrincipal Long usuarioId,
            @Valid @RequestBody PerfilRequest req) {
        return usuarioService.actualizarPerfil(usuarioId, req);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(@AuthenticationPrincipal Long usuarioId,
            @Valid @RequestBody CambiarPasswordRequest req) {
        usuarioService.actualizarContrasena(usuarioId, req);
        return ResponseEntity.noContent().build();
    }
}