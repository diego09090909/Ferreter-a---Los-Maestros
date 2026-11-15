package com.ferreteria.ms_ventas.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private static final String TIPO_ACCESS = "access";
    private static final String ROL_SERVICIO = "SERVICIO";
    private static final long DURACION_TOKEN_SERVICIO_MS = 5 * 60 * 1000;

    private final SecretKey key;

    public JwtService(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public Claims validarAccessToken(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();

        if (!TIPO_ACCESS.equals(claims.get("tipo", String.class))) {
            throw new JwtException("Tipo de token inválido");
        }
        return claims;
    }

    // token corto con rol SERVICIO para que ms-ventas pueda descontar y reponer stock en ms-catalogo.
    // Se firma con la misma clave app.jwt.secret que comparten los microservicios.
    public String generarTokenServicio() {
        Date ahora = new Date();
        return Jwts.builder()
                .subject("ms-ventas")
                .claim("id", 0)
                .claim("rol", ROL_SERVICIO)
                .claim("tipo", TIPO_ACCESS)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + DURACION_TOKEN_SERVICIO_MS))
                .signWith(key)
                .compact();
    }
}
