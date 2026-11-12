package com.ferreteria.ms_usuarios.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.service.DireccionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios/{usuarioId}/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public List<DireccionResponse> listar(@PathVariable Long usuarioId) {
        return direccionService.listar(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DireccionResponse agregar(@PathVariable Long usuarioId,
                                     @Valid @RequestBody DireccionRequest req) {
        return direccionService.agregar(usuarioId, req);
    }

    @PutMapping("/{direccionId}")
    public DireccionResponse actualizar(@PathVariable Long usuarioId,
                                        @PathVariable Long direccionId,
                                        @Valid @RequestBody DireccionRequest req) {
        return direccionService.actualizar(usuarioId, direccionId, req);
    }

    @PutMapping("/{direccionId}/predeterminada")
    public DireccionResponse marcarPredeterminada(@PathVariable Long usuarioId,
                                                  @PathVariable Long direccionId) {
        return direccionService.marcarPredeterminada(usuarioId, direccionId);
    }

    @DeleteMapping("/{direccionId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long usuarioId,
                                         @PathVariable Long direccionId) {
        direccionService.eliminar(usuarioId, direccionId);
        return ResponseEntity.noContent().build();
    }
}