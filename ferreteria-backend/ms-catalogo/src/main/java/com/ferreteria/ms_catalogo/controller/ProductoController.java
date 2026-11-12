package com.ferreteria.ms_catalogo.controller;

import com.ferreteria.ms_catalogo.dto.ProductoAdminResponse;
import com.ferreteria.ms_catalogo.dto.ProductoRequest;
import com.ferreteria.ms_catalogo.dto.ProductoResponse;
import com.ferreteria.ms_catalogo.dto.StockRequest;
import com.ferreteria.ms_catalogo.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Productos", description = "Catálogo de productos, panel admin y control de stock")
public class ProductoController {

    private final ProductoService productoService;

    @Operation(summary = "Lista los productos de la tienda", description = "Filtros opcionales: categoria (nombre) y buscar (texto en el nombre). No incluye precio de compra.")
    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar(@RequestParam(required = false) String categoria,
            @RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(productoService.listar(categoria, buscar));
    }

    @Operation(summary = "Detalle de un producto para la tienda")
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @Operation(summary = "Lista los productos para el panel admin", description = "Incluye precio de compra, margen y stock mínimo. Acepta los mismos filtros que la tienda.")
    @GetMapping("/admin")
    public ResponseEntity<List<ProductoAdminResponse>> listarParaAdmin(@RequestParam(required = false) String categoria,
            @RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(productoService.listarParaAdmin(categoria, buscar));
    }

    @Operation(summary = "Detalle completo de un producto para el panel admin")
    @GetMapping("/admin/{id}")
    public ResponseEntity<ProductoAdminResponse> buscarPorIdParaAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorIdParaAdmin(id));
    }

    @Operation(summary = "Productos en su stock mínimo o menos", description = "Para reponer bodega. Ordenados del más urgente al menos urgente.")
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<ProductoAdminResponse>> stockBajo() {
        return ResponseEntity.ok(productoService.stockBajo());
    }

    @Operation(summary = "Crea un producto", description = "El código debe ser único (ej: MC001) y el precio de venta mayor al de compra.")
    @PostMapping
    public ResponseEntity<ProductoAdminResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(request));
    }

    @Operation(summary = "Actualiza un producto")
    @PutMapping("/{id}")
    public ResponseEntity<ProductoAdminResponse> actualizar(@PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @Operation(summary = "Elimina un producto")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Descuenta stock al confirmar una compra", description = "Lo llama ms-ventas. Responde 400 si no hay stock suficiente.")
    @PutMapping("/{id}/descontar-stock")
    public ResponseEntity<ProductoResponse> descontarStock(@PathVariable Long id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(productoService.descontarStock(id, request.getCantidad()));
    }

    @Operation(summary = "Repone stock al anular una venta", description = "Lo llama ms-ventas.")
    @PutMapping("/{id}/reponer-stock")
    public ResponseEntity<ProductoResponse> reponerStock(@PathVariable Long id,
            @Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(productoService.reponerStock(id, request.getCantidad()));
    }
}