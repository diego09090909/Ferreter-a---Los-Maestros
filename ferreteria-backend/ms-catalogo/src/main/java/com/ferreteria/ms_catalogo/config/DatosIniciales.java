package com.ferreteria.ms_catalogo.config;

import com.ferreteria.ms_catalogo.model.Categoria;
import com.ferreteria.ms_catalogo.model.Producto;
import com.ferreteria.ms_catalogo.repository.CategoriaRepository;
import com.ferreteria.ms_catalogo.repository.ProductoRepository;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatosIniciales implements CommandLineRunner {

    private static final String SEPARADOR = ";";

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    @Override
    @Transactional
    public void run(String... args) throws IOException {
        if (productoRepository.count() > 0) {
            log.info("Catalogo con datos: se omite la carga inicial");
            return;
        }

        Map<String, Categoria> categorias = cargarCategorias();
        int total = cargarProductos(categorias);
        log.info("Carga inicial lista: {} categorias y {} productos", categorias.size(), total);
    }

    private Map<String, Categoria> cargarCategorias() throws IOException {
        Map<String, Categoria> categorias = new HashMap<>();

        for (String[] fila : leerCsv("data/categorias.csv")) {
            Categoria categoria = categoriaRepository.findByNombre(fila[0])
                    .orElseGet(() -> categoriaRepository.save(new Categoria(null, fila[0], fila[1], fila[2])));
            categorias.put(categoria.getNombre(), categoria);
        }
        return categorias;
    }

    private int cargarProductos(Map<String, Categoria> categorias) throws IOException {
        List<String[]> filas = leerCsv("data/productos.csv");

        for (String[] fila : filas) {
            Categoria categoria = categorias.get(fila[1]);
            if (categoria == null) {
                throw new IllegalStateException("El producto " + fila[0] + " tiene la categoria '" + fila[1]
                        + "', que no existe en categorias.csv");
            }

            Producto producto = new Producto();
            producto.setCodigo(fila[0]);
            producto.setCategoria(categoria);
            producto.setSubcategoria(fila[2]);
            producto.setNombre(fila[3]);
            producto.setMarca(fila[4]);
            producto.setUnidad(fila[5]);
            producto.setPrecioCompra(Integer.parseInt(fila[6]));
            producto.setPrecio(Integer.parseInt(fila[7]));
            producto.setStock(Integer.parseInt(fila[8]));
            producto.setStockMinimo(Integer.parseInt(fila[9]));
            productoRepository.save(producto);
        }
        return filas.size();
    }

    private List<String[]> leerCsv(String ruta) throws IOException {
        ClassPathResource archivo = new ClassPathResource(ruta);
        try (BufferedReader lector = new BufferedReader(
                new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            return lector.lines()
                    .skip(1)
                    .filter(linea -> !linea.isBlank())
                    .map(linea -> linea.trim().split(SEPARADOR, -1))
                    .toList();
        }
    }
}