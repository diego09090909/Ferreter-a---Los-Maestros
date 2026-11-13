package com.ferreteria.ms_usuarios.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.ActualizarUsuarioRequest;
import com.ferreteria.ms_usuarios.dto.CrearUsuarioRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.service.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@RequiredArgsConstructor
@Tag(name = "Administración de usuarios", description = "Gestión de usuarios del sistema. Solo para administradores")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Listar usuarios",
               description = "Devuelve todos los usuarios registrados en el sistema.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol administrador")
    })
    @GetMapping
    public List<UsuarioResponse> listar() {
        return adminService.listarUsuarios();
    }

    @Operation(summary = "Obtener usuario",
               description = "Devuelve los datos de un usuario a partir de su ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario obtenido correctamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol administrador"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @GetMapping("/{id}")
    public UsuarioResponse obtener(@Parameter(description = "ID del usuario") @PathVariable Long id) {
        return adminService.obtenerUsuario(id);
    }

    @Operation(summary = "Crear usuario",
               description = "Crea un usuario con el rol indicado y devuelve sus datos.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Usuario creado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes, RUT inválido o rol no válido)"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol administrador"),
        @ApiResponse(responseCode = "409", description = "El email o el RUT ya están registrados")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody CrearUsuarioRequest req) {
        return adminService.crearUsuario(req);
    }

    @Operation(summary = "Eliminar usuario",
               description = "Elimina un usuario del sistema. Un administrador no puede eliminarse a sí mismo.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Usuario eliminado correctamente"),
        @ApiResponse(responseCode = "400", description = "Operación no permitida (el administrador intenta eliminarse a sí mismo)"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol administrador"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@Parameter(description = "ID del usuario") @PathVariable Long id,
            @Parameter(hidden = true) @AuthenticationPrincipal Long adminId) {
        adminService.eliminarUsuario(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Actualizar usuario",
               description = "Modifica los datos de un usuario y devuelve el usuario actualizado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Usuario actualizado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o cambio no permitido"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol administrador"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe"),
        @ApiResponse(responseCode = "409", description = "El email o el RUT ya están registrados por otro usuario")
    })
    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@Parameter(description = "ID del usuario") @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest req,
            @Parameter(hidden = true) @AuthenticationPrincipal Long adminId) {
        return adminService.actualizarUsuario(id, req, adminId);
    }
}