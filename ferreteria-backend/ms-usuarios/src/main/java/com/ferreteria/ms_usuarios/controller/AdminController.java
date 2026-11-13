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
import jakarta.validation.Valid;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin/usuarios")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public List<UsuarioResponse> listar() {
        return adminService.listarUsuarios();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return adminService.obtenerUsuario(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody CrearUsuarioRequest req) {
        return adminService.crearUsuario(req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
            @AuthenticationPrincipal Long adminId) {
        adminService.eliminarUsuario(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest req,
            @AuthenticationPrincipal Long adminId) {
        return adminService.actualizarUsuario(id, req, adminId);
    }
}