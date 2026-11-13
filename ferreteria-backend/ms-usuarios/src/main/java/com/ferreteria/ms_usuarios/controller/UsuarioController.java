package com.ferreteria.ms_usuarios.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.PerfilRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios/me")
@RequiredArgsConstructor
@Tag(name = "Perfil de usuario", description = "Consulta y actualización del perfil del usuario autenticado")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Obtener mi perfil",
               description = "Devuelve los datos del perfil del usuario autenticado, identificado por su token de acceso.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @GetMapping
    public UsuarioResponse obtenerPerfil(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId) {
        return usuarioService.obtenerPerfil(usuarioId);
    }

    @Operation(summary = "Actualizar mi perfil",
               description = "Modifica los datos personales del usuario autenticado y devuelve el perfil actualizado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Perfil actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes o con formato incorrecto)"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @PutMapping
    public UsuarioResponse actualizarPerfil(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
            @Valid @RequestBody PerfilRequest req) {
        return usuarioService.actualizarPerfil(usuarioId, req);
    }

    @Operation(summary = "Cambiar contraseña",
               description = "Cambia la contraseña del usuario autenticado. Requiere la contraseña actual y la nueva.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Contraseña actualizada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes, contraseña actual incorrecta o nueva contraseña no válida)"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
            @Valid @RequestBody CambiarPasswordRequest req) {
        usuarioService.actualizarContrasena(usuarioId, req);
        return ResponseEntity.noContent().build();
    }
}