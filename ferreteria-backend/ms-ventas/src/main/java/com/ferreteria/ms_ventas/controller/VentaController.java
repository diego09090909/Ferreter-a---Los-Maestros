package com.ferreteria.ms_ventas.controller;

import com.ferreteria.ms_ventas.dto.EstadoVentaRequest;
import com.ferreteria.ms_ventas.dto.VentaRequest;
import com.ferreteria.ms_ventas.dto.VentaResponse;
import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.service.VentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
@Tag(name = "Ventas", description = "Checkout del carrito, historial de compras y gestión de estados")
public class VentaController {
    private final VentaService ventaService;

    @PostMapping
    @Operation(summary = "Crea una venta para el usuario del token (checkout del carrito)",
            description = "Valida stock y disponibilidad en ms-catalogo, descuenta el stock, calcula el costo "
                    + "de despacho según la comuna y guarda la venta en estado PENDIENTE.")
    @ApiResponse(responseCode = "201", description = "Venta creada")
    @ApiResponse(responseCode = "400", description = "Datos inválidos, sin stock, producto no disponible o comuna sin cobertura")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    @ApiResponse(responseCode = "404", description = "Algún producto no existe")
    @ApiResponse(responseCode = "503", description = "ms-catalogo no disponible")
    public ResponseEntity<VentaResponse> crear(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                               @Valid @RequestBody VentaRequest request) {
        VentaResponse venta = ventaService.crear(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(venta);
    }

    @GetMapping("/mis-ventas")
    @Operation(summary = "Historial de compras del usuario del token",
            description = "Ordenadas de la más reciente a la más antigua.")
    @ApiResponse(responseCode = "200", description = "Lista de ventas (puede venir vacía)")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    public ResponseEntity<List<VentaResponse>> misVentas(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId) {
        return ResponseEntity.ok(ventaService.listarDelUsuario(usuarioId));
    }

    @GetMapping("/mis-ventas/{ventaId}")
    @Operation(summary = "Detalle de una compra del usuario del token",
            description = "Responde 404 si la venta no existe o pertenece a otro usuario.")
    @ApiResponse(responseCode = "200", description = "Venta encontrada")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    @ApiResponse(responseCode = "404", description = "No existe o es de otro usuario")
    public ResponseEntity<VentaResponse> miVenta(@Parameter(hidden = true) @AuthenticationPrincipal Long usuarioId,
                                                 @Parameter(description = "ID de la venta", example = "1")
                                                 @PathVariable Long ventaId) {
        return ResponseEntity.ok(ventaService.obtenerDelUsuario(ventaId, usuarioId));
    }

    @GetMapping
    @Operation(summary = "Lista todas las ventas (ADMIN o VENDEDOR)", description = "Filtro opcional por estado.")
    @ApiResponse(responseCode = "200", description = "Lista de ventas")
    @ApiResponse(responseCode = "400", description = "Estado inválido")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    @ApiResponse(responseCode = "403", description = "El rol no tiene permiso")
    public ResponseEntity<List<VentaResponse>> listarTodas(
            @Parameter(description = "Filtrar por estado (opcional)") @RequestParam(required = false) EstadoVenta estado) {
        return ResponseEntity.ok(ventaService.listarTodas(estado));
    }

    @GetMapping("/{ventaId}")
    @Operation(summary = "Detalle de cualquier venta (ADMIN o VENDEDOR)")
    @ApiResponse(responseCode = "200", description = "Venta encontrada")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    @ApiResponse(responseCode = "403", description = "El rol no tiene permiso")
    @ApiResponse(responseCode = "404", description = "La venta no existe")
    public ResponseEntity<VentaResponse> obtener(
            @Parameter(description = "ID de la venta", example = "1") @PathVariable Long ventaId) {
        return ResponseEntity.ok(ventaService.obtenerPorId(ventaId));
    }

    @PatchMapping("/{ventaId}/estado")
    @Operation(summary = "Cambia el estado de una venta (solo ADMIN)",
            description = "Transiciones permitidas: PENDIENTE→PAGADA|ANULADA, PAGADA→DESPACHADA|ANULADA, "
                    + "DESPACHADA→ENTREGADA. Al ANULAR se repone el stock en ms-catalogo.")
    @ApiResponse(responseCode = "200", description = "Estado actualizado")
    @ApiResponse(responseCode = "400", description = "Transición no permitida o estado inválido")
    @ApiResponse(responseCode = "401", description = "Sin token o token inválido")
    @ApiResponse(responseCode = "403", description = "Solo el administrador puede cambiar estados")
    @ApiResponse(responseCode = "404", description = "La venta no existe")
    @ApiResponse(responseCode = "503", description = "ms-catalogo no disponible (al anular)")
    public ResponseEntity<VentaResponse> cambiarEstado(
            @Parameter(description = "ID de la venta", example = "1") @PathVariable Long ventaId,
            @Valid @RequestBody EstadoVentaRequest request) {
        return ResponseEntity.ok(ventaService.cambiarEstado(ventaId, request));
    }
}
