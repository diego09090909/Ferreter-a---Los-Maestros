package com.ferreteria.ms_usuarios.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ferreteria.ms_usuarios.dto.AuthResponse;
import com.ferreteria.ms_usuarios.dto.LoginRequest;
import com.ferreteria.ms_usuarios.dto.RefreshRequest;
import com.ferreteria.ms_usuarios.dto.RegistroRequest;
import com.ferreteria.ms_usuarios.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Registro, login y renovación de tokens JWT")
public class AuthController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Registrar cliente",
               description = "Crea una cuenta con rol CLIENTE y devuelve los tokens de acceso. La dirección es opcional y solo se despacha a comunas de la Región de Coquimbo.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Cliente creado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes, RUT inválido o comuna no permitida)"),
        @ApiResponse(responseCode = "409", description = "El email o el RUT ya están registrados")
    })
    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(req));
    }

    @Operation(summary = "Iniciar sesión",
               description = "Autentica con email o RUT y contraseña. Devuelve el token de acceso y el de renovación.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login correcto, devuelve los tokens"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (campos faltantes)"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(usuarioService.login(req));
    }

    @Operation(summary = "Renovar token",
               description = "Recibe el refresh token y devuelve un nuevo token de acceso.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Token renovado correctamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos (falta el refresh token)"),
        @ApiResponse(responseCode = "401", description = "Refresh token inválido o vencido")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(usuarioService.renovar(req));
    }
}