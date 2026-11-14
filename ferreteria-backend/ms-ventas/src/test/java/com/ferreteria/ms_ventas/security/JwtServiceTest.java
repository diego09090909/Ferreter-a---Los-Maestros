package com.ferreteria.ms_ventas.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Encoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class JwtServiceTest {
    private final SecretKey clave = Jwts.SIG.HS256.key().build();
    private final SecretKey otraClave = Jwts.SIG.HS256.key().build();

    private final JwtService jwtService = new JwtService(Encoders.BASE64.encode(clave.getEncoded()));

    private String token(SecretKey firma, String tipo, long venceEnMs) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject("cliente@correo.cl")
                .claim("id", 5L)
                .claim("rol", "CLIENTE")
                .claim("tipo", tipo)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + venceEnMs))
                .signWith(firma)
                .compact();
    }

    @Test
    @DisplayName("Token de acceso válido: devuelve id y rol")
    void tokenValido() {
        Claims claims = jwtService.validarAccessToken(token(clave, "access", 60_000));

        assertThat(claims.get("id", Number.class).longValue()).isEqualTo(5L);
        assertThat(claims.get("rol", String.class)).isEqualTo("CLIENTE");
    }

    @Test
    @DisplayName("Token firmado con otra clave (falsificado): se rechaza")
    void tokenConOtraFirma() {
        assertThatThrownBy(() -> jwtService.validarAccessToken(token(otraClave, "access", 60_000)))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Refresh token usado como token de acceso: se rechaza")
    void refreshToken() {
        assertThatThrownBy(() -> jwtService.validarAccessToken(token(clave, "refresh", 60_000)))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Token vencido: se rechaza")
    void tokenVencido() {
        assertThatThrownBy(() -> jwtService.validarAccessToken(token(clave, "access", -1_000)))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Texto que no es un token: se rechaza")
    void basura() {
        assertThatThrownBy(() -> jwtService.validarAccessToken("esto-no-es-un-token"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    @DisplayName("Usuario con rol ADMIN: el claim rol llega tal cual")
    void rolAdmin() {
        String tokenAdmin = Jwts.builder()
                .claim("id", 1L).claim("rol", "ADMIN").claim("tipo", "access")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(clave).compact();

        assertThat(jwtService.validarAccessToken(tokenAdmin).get("rol", String.class)).isEqualTo("ADMIN");
    }
}
