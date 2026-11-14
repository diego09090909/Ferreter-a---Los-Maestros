package com.ferreteria.ms_ventas.client;

import com.ferreteria.ms_ventas.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_ventas.exception.ReglaNegocioException;
import com.ferreteria.ms_ventas.exception.ServicioNoDisponibleException;
import java.time.Duration;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class CatalogoClient {
    private static final Logger log = LoggerFactory.getLogger(CatalogoClient.class);

    private final RestClient restClient;

    public CatalogoClient(@Value("${catalogo.url}") String catalogoUrl,
                          @Value("${catalogo.connect-timeout:2s}") Duration connectTimeout,
                          @Value("${catalogo.read-timeout:5s}") Duration readTimeout) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);

        this.restClient = RestClient.builder()
                .baseUrl(catalogoUrl)
                .requestFactory(factory)
                .build();
    }

    public ProductoCatalogo obtenerProducto(Long productoId) {
        try {
            ProductoCatalogo producto = restClient.get()
                    .uri("/api/v1/productos/{id}", productoId)
                    .retrieve()
                    .body(ProductoCatalogo.class);
            if (producto == null) {
                throw new ServicioNoDisponibleException("El catálogo respondió vacío para el producto " + productoId);
            }
            return producto;
        } catch (RestClientException e) {
            throw traducirError(e, productoId, "consultar producto");
        }
    }

    public void descontarStock(Long productoId, int cantidad) {
        try {
            restClient.put()
                    .uri("/api/v1/productos/{id}/descontar-stock", productoId)
                    .body(Map.of("cantidad", cantidad))
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new ReglaNegocioException("No hay stock suficiente del producto " + productoId);
            }
            throw traducirError(e, productoId, "descontar stock");
        } catch (RestClientException e) {
            throw traducirError(e, productoId, "descontar stock");
        }
    }

    public void reponerStock(Long productoId, int cantidad) {
        try {
            restClient.put()
                    .uri("/api/v1/productos/{id}/reponer-stock", productoId)
                    .body(Map.of("cantidad", cantidad))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            throw traducirError(e, productoId, "reponer stock");
        }
    }

    private RuntimeException traducirError(RestClientException e, Long productoId, String operacion) {
        if (e instanceof HttpClientErrorException.NotFound) {
            return new RecursoNoEncontradoException("El producto " + productoId + " no existe");
        }
        log.error("Error al {} del producto {} en ms-catalogo", operacion, productoId, e);
        return new ServicioNoDisponibleException("El catálogo no está disponible, intente más tarde");
    }
}
