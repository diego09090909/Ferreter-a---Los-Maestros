package com.ferreteria.ms_usuarios.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    @ToString.Exclude
    private String token;

    @ToString.Exclude
    private String refreshToken;

    private String tipo;
    private Long expiraEnMs;
    private UsuarioResponse usuario;
}