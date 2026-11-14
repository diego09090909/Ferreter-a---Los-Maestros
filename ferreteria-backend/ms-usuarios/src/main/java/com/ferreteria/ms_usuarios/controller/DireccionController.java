package com.ferreteria.ms_usuarios.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.service.DireccionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios/me/direcciones")
@RequiredArgsConstructor
@Tag(name = "Direcciones", description = "Gestión de las direcciones de despacho del usuario autenticado")
@SecurityRequirement(name = "bearerAuth")
public class DireccionController {

    private final DireccionService direccionService;

    @Operation(summary = "Listar mis direcciones",
               description = "Devuelve todas las direcciones registradas por el usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Listado obtenido correctamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)")
    })
    @GetMapping
    public List<DireccionResponse> listar(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId) {
        return direccionService.listar(usuarioId);
    }

    @Operation(summary = "Agregar dirección",
               description = "Registra una nueva dirección para el usuario autenticado. Solo se despacha a comunas de la Región de Coquimbo y se permiten hasta 5 direcciones por usuario.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Dirección creada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes o comuna no permitida) o se alcanzó el máximo de 5 direcciones"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "El usuario no existe")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DireccionResponse agregar(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                     @Valid @RequestBody DireccionRequest req) {
        return direccionService.agregar(usuarioId, req);
    }

    @Operation(summary = "Actualizar dirección",
               description = "Modifica una dirección existente del usuario autenticado y devuelve la dirección actualizada.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dirección actualizada correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes o comuna no permitida)"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "La dirección no existe o no pertenece al usuario")
    })
    @PutMapping("/{direccionId}")
    public DireccionResponse actualizar(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                        @Parameter(description = "ID de la dirección") @PathVariable Long direccionId,
                                        @Valid @RequestBody DireccionRequest req) {
        return direccionService.actualizar(usuarioId, direccionId, req);
    }

    @Operation(summary = "Marcar dirección predeterminada",
               description = "Define la dirección indicada como predeterminada del usuario autenticado.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dirección marcada como predeterminada"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "La dirección no existe o no pertenece al usuario")
    })
    @PutMapping("/{direccionId}/predeterminada")
    public DireccionResponse marcarPredeterminada(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                                  @Parameter(description = "ID de la dirección") @PathVariable Long direccionId) {
        return direccionService.marcarPredeterminada(usuarioId, direccionId);
    }

    @Operation(summary = "Eliminar dirección",
               description = "Elimina una dirección del usuario autenticado. Si era la predeterminada, otra queda como predeterminada.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Dirección eliminada correctamente"),
        @ApiResponse(responseCode = "401", description = "No autenticado (token faltante, inválido o vencido)"),
        @ApiResponse(responseCode = "404", description = "La dirección no existe o no pertenece al usuario")
    })
    @DeleteMapping("/{direccionId}")
    public ResponseEntity<Void> eliminar(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                         @Parameter(description = "ID de la dirección") @PathVariable Long direccionId) {
        direccionService.eliminar(usuarioId, direccionId);
        return ResponseEntity.noContent().build();
    }
}