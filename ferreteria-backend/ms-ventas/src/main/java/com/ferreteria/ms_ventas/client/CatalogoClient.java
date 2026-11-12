
package com.ferreteria.ms_ventas.client;

import com.ferreteria.ms_ventas.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_ventas.exception.ReglaNegocioException;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

@Component
public class CatalogoClient {

    private final RestClient restClient;

    public CatalogoClient(@Value("${catalogo.url}") String catalogoUrl) {
        this.restClient = RestClient.create(catalogoUrl);
    }

    public ProductoCatalogo obtenerProducto(Long productoId) {
        try {
            return restClient.get()
                    .uri("/api/v1/productos/{id}", productoId)
                    .retrieve()
                    .body(ProductoCatalogo.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RecursoNoEncontradoException("El producto " + productoId + " no existe");
        } catch (ResourceAccessException e) {
            throw new ReglaNegocioException("El catálogo no está disponible, intente más tarde");
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
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RecursoNoEncontradoException("El producto " + productoId + " no existe");
            }
            throw new ReglaNegocioException("No hay stock suficiente del producto " + productoId);
        } catch (ResourceAccessException e) {
            throw new ReglaNegocioException("El catálogo no está disponible, intente más tarde");
        }
    }

    public void reponerStock(Long productoId, int cantidad) {
        restClient.put()
                .uri("/api/v1/productos/{id}/reponer-stock", productoId)
                .body(Map.of("cantidad", cantidad))
                .retrieve()
                .toBodilessEntity();
    }
}
