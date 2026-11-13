package com.ferreteria.ms_usuarios.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ferreteria.ms_usuarios.model.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String TIPO_ACCESS = "access";
    private static final String TIPO_REFRESH = "refresh";

    private final SecretKey key;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generarAccessToken(Usuario usuario) {
        return construir(usuario, TIPO_ACCESS, accessExpirationMs);
    }

    public String generarRefreshToken(Usuario usuario) {
        return construir(usuario, TIPO_REFRESH, refreshExpirationMs);
    }

    public Claims validarAccessToken(String token) {
        return validar(token, TIPO_ACCESS);
    }

    public Claims validarRefreshToken(String token) {
        return validar(token, TIPO_REFRESH);
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    private String construir(Usuario usuario, String tipo, long duracionMs) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("id", usuario.getId())
                .claim("rol", usuario.getRol().name())
                .claim("tipo", tipo)
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + duracionMs))
                .signWith(key)
                .compact();
    }

    private Claims validar(String token, String tipoEsperado) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();

        if (!tipoEsperado.equals(claims.get("tipo", String.class))) {
            throw new JwtException("Tipo de token inválido");
        }
        return claims;
    }
}