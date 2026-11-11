package com.ferreteria.ms_catalogo.controller;

import com.ferreteria.ms_catalogo.dto.ProductoAdminResponse;
import com.ferreteria.ms_catalogo.dto.ProductoRequest;
import com.ferreteria.ms_catalogo.dto.ProductoResponse;
import com.ferreteria.ms_catalogo.dto.StockRequest;
import com.ferreteria.ms_catalogo.service.ProductoService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar(@RequestParam(required = false) String categoria,
            @RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(productoService.listar(categoria, buscar));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @GetMapping("/admin")
    public ResponseEntity<List<ProductoAdminResponse>> listarParaAdmin(@RequestParam(required = false) String categoria,
            @RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(productoService.listarParaAdmin(categoria, buscar));
    }

    @GetMapping("/admin/{id}")
    public ResponseEntity<ProductoAdminResponse> buscarPorIdParaAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorIdParaAdmin(id));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<List<ProductoAdminResponse>> stockBajo() {
        return ResponseEntity.ok(productoService.stockBajo());
    }

    @PostMapping
    public ResponseEntity<ProductoAdminResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoAdminResponse> actualizar(@PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/descontar-stock")
    public ResponseEntity<ProductoResponse> descontarStock(@PathVariable Long id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(productoService.descontarStock(id, request.getCantidad()));
    }

    @PutMapping("/{id}/reponer-stock")
    public ResponseEntity<ProductoResponse> reponerStock(@PathVariable Long id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(productoService.reponerStock(id, request.getCantidad()));
    }
}