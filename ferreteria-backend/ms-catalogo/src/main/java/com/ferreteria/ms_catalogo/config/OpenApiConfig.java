package com.ferreteria.ms_catalogo.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(
        title = "ms-catalogo - Ferretería Los Maestros",
        version = "v1",
        description = "Productos, categorías y control de stock del catálogo"))
public class OpenApiConfig {
}