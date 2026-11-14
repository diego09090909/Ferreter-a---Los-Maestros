package com.ferreteria.ms_ventas.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ms-ventas - Ferretería Los Maestros",
                version = "v1",
                description = "Ventas (boletas) y su detalle: checkout del carrito, historial del cliente, "
                        + "gestión de estados y control de stock con ms-catalogo. "
                        + "Todos los endpoints requieren un token JWT de ms-usuarios."),
        security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class OpenApiConfig {
}
