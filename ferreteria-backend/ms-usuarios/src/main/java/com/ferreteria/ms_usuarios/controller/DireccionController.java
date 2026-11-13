package com.ferreteria.ms_usuarios.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.service.DireccionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios/me/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public List<DireccionResponse> listar(@AuthenticationPrincipal Long usuarioId) {
        return direccionService.listar(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DireccionResponse agregar(@AuthenticationPrincipal Long usuarioId,
                                     @Valid @RequestBody DireccionRequest req) {
        return direccionService.agregar(usuarioId, req);
    }

    @PutMapping("/{direccionId}")
    public DireccionResponse actualizar(@AuthenticationPrincipal Long usuarioId,
                                        @PathVariable Long direccionId,
                                        @Valid @RequestBody DireccionRequest req) {
        return direccionService.actualizar(usuarioId, direccionId, req);
    }

    @PutMapping("/{direccionId}/predeterminada")
    public DireccionResponse marcarPredeterminada(@AuthenticationPrincipal Long usuarioId,
                                                  @PathVariable Long direccionId) {
        return direccionService.marcarPredeterminada(usuarioId, direccionId);
    }

    @DeleteMapping("/{direccionId}")
    public ResponseEntity<Void> eliminar(@AuthenticationPrincipal Long usuarioId,
                                         @PathVariable Long direccionId) {
        direccionService.eliminar(usuarioId, direccionId);
        return ResponseEntity.noContent().build();
    }
}