package com.ferreteria.ms_ventas.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ferreteria.ms_ventas.client.CatalogoClient;
import com.ferreteria.ms_ventas.client.ProductoCatalogo;
import com.ferreteria.ms_ventas.dto.EstadoVentaRequest;
import com.ferreteria.ms_ventas.dto.ItemVentaRequest;
import com.ferreteria.ms_ventas.dto.VentaRequest;
import com.ferreteria.ms_ventas.dto.VentaResponse;
import com.ferreteria.ms_ventas.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_ventas.exception.ReglaNegocioException;
import com.ferreteria.ms_ventas.exception.ServicioNoDisponibleException;
import com.ferreteria.ms_ventas.mapper.VentaMapper;
import com.ferreteria.ms_ventas.model.DetalleVenta;
import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.TipoEntrega;
import com.ferreteria.ms_ventas.model.Venta;
import com.ferreteria.ms_ventas.repository.VentaRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {
    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private CatalogoClient catalogoClient;

    private VentaService ventaService;

    private final ProductoCatalogo taladro = new ProductoCatalogo(1L, "Taladro", 30_000, 10, true);
    private final ProductoCatalogo brocha = new ProductoCatalogo(2L, "Brocha", 2_000, 50, true);

    @BeforeEach
    void setUp() {
        ventaService = new VentaService(ventaRepository, catalogoClient, new CalculadoraDespacho(), new VentaMapper());
    }

    @Test
    @DisplayName("Crear con retiro en tienda: calcula subtotal, sin despacho, descuenta stock y guarda")
    void crearRetiroEnTienda() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);
        when(catalogoClient.obtenerProducto(2L)).thenReturn(brocha);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        VentaResponse venta = ventaService.crear(5L, retiro(item(1L, 1), item(2L, 3)));

        assertThat(venta.getUsuarioId()).isEqualTo(5L);
        assertThat(venta.getSubtotal()).isEqualTo(36_000);
        assertThat(venta.getCostoDespacho()).isZero();
        assertThat(venta.getTotal()).isEqualTo(36_000);
        assertThat(venta.getDetalles()).hasSize(2);
        verify(catalogoClient).descontarStock(1L, 1);
        verify(catalogoClient).descontarStock(2L, 3);
    }

    @Test
    @DisplayName("Si el carrito trae el mismo producto dos veces, se agrupa en una sola línea")
    void crearAgrupaProductosRepetidos() {
        when(catalogoClient.obtenerProducto(2L)).thenReturn(brocha);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        VentaResponse venta = ventaService.crear(5L, retiro(item(2L, 2), item(2L, 3)));

        assertThat(venta.getDetalles()).hasSize(1);
        assertThat(venta.getDetalles().get(0).getCantidad()).isEqualTo(5);
        verify(catalogoClient).descontarStock(2L, 5);
    }

    @Test
    @DisplayName("Despacho a La Serena bajo $50.000 cobra $3.990")
    void crearDespachoConCosto() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        VentaResponse venta = ventaService.crear(5L, despacho("la serena", item(1L, 1)));

        assertThat(venta.getComunaDespacho()).isEqualTo("La Serena");
        assertThat(venta.getSubtotal()).isEqualTo(30_000);
        assertThat(venta.getCostoDespacho()).isEqualTo(3_990);
        assertThat(venta.getTotal()).isEqualTo(33_990);
    }

    @Test
    @DisplayName("Despacho a La Serena desde $50.000 es gratis")
    void crearDespachoGratis() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);
        when(ventaRepository.save(any(Venta.class))).thenAnswer(inv -> inv.getArgument(0));

        VentaResponse venta = ventaService.crear(5L, despacho("La Serena", item(1L, 2)));

        assertThat(venta.getCostoDespacho()).isZero();
        assertThat(venta.getTotal()).isEqualTo(60_000);
    }

    @Test
    @DisplayName("Comuna sin cobertura: error antes de consultar el catálogo")
    void crearComunaSinCobertura() {
        assertThatThrownBy(() -> ventaService.crear(5L, despacho("La Higuera", item(1L, 1))))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("La Higuera");

        verify(catalogoClient, never()).obtenerProducto(anyLong());
        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Stock insuficiente: error, no descuenta nada y no guarda")
    void crearSinStock() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);

        assertThatThrownBy(() -> ventaService.crear(5L, retiro(item(1L, 11))))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("Stock insuficiente");

        verify(catalogoClient, never()).descontarStock(anyLong(), anyInt());
        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Producto no disponible: error")
    void crearProductoNoDisponible() {
        when(catalogoClient.obtenerProducto(1L))
                .thenReturn(new ProductoCatalogo(1L, "Taladro", 30_000, 10, false));

        assertThatThrownBy(() -> ventaService.crear(5L, retiro(item(1L, 1))))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("no está disponible");
    }

    @Test
    @DisplayName("Si falla el descuento del 2° producto, se repone el 1° y no se guarda (compensación)")
    void crearCompensaSiFallaDescuento() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);
        when(catalogoClient.obtenerProducto(2L)).thenReturn(brocha);
        doNothing().when(catalogoClient).descontarStock(1L, 1);
        doThrow(new ReglaNegocioException("No hay stock suficiente del producto 2"))
                .when(catalogoClient).descontarStock(2L, 3);

        assertThatThrownBy(() -> ventaService.crear(5L, retiro(item(1L, 1), item(2L, 3))))
                .isInstanceOf(ReglaNegocioException.class);

        verify(catalogoClient).reponerStock(1L, 1);
        verify(catalogoClient, never()).reponerStock(2L, 3);
        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Si falla el guardado, se repone todo el stock descontado")
    void crearCompensaSiFallaGuardado() {
        when(catalogoClient.obtenerProducto(1L)).thenReturn(taladro);
        when(catalogoClient.obtenerProducto(2L)).thenReturn(brocha);
        when(ventaRepository.save(any(Venta.class))).thenThrow(new RuntimeException("MySQL caído"));

        assertThatThrownBy(() -> ventaService.crear(5L, retiro(item(1L, 1), item(2L, 3))))
                .hasMessage("MySQL caído");

        verify(catalogoClient).reponerStock(1L, 1);
        verify(catalogoClient).reponerStock(2L, 3);
    }

    @Test
    @DisplayName("Catálogo con datos incompletos (precio null): 503 y no NullPointerException")
    void crearDatosIncompletosDelCatalogo() {
        when(catalogoClient.obtenerProducto(1L))
                .thenReturn(new ProductoCatalogo(1L, "Taladro", null, 10, true));

        assertThatThrownBy(() -> ventaService.crear(5L, retiro(item(1L, 1))))
                .isInstanceOf(ServicioNoDisponibleException.class);
    }

    @Test
    @DisplayName("Un usuario no puede ver la venta de otro: 404")
    void obtenerVentaDeOtroUsuario() {
        when(ventaRepository.findWithDetallesById(1L)).thenReturn(Optional.of(venta(EstadoVenta.PENDIENTE)));

        assertThatThrownBy(() -> ventaService.obtenerDelUsuario(1L, 6L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    @DisplayName("PENDIENTE -> PAGADA: cambia el estado sin tocar el stock")
    void cambiarAPagada() {
        Venta venta = venta(EstadoVenta.PENDIENTE);
        when(ventaRepository.findWithDetallesById(1L)).thenReturn(Optional.of(venta));

        VentaResponse respuesta = ventaService.cambiarEstado(1L, new EstadoVentaRequest(EstadoVenta.PAGADA));

        assertThat(respuesta.getEstado()).isEqualTo(EstadoVenta.PAGADA);
        verify(ventaRepository).save(venta);
        verify(catalogoClient, never()).reponerStock(anyLong(), anyInt());
    }

    @Test
    @DisplayName("Transición inválida (PENDIENTE -> ENTREGADA): error y no guarda")
    void cambiarEstadoInvalido() {
        when(ventaRepository.findWithDetallesById(1L)).thenReturn(Optional.of(venta(EstadoVenta.PENDIENTE)));

        assertThatThrownBy(() -> ventaService.cambiarEstado(1L, new EstadoVentaRequest(EstadoVenta.ENTREGADA)))
                .isInstanceOf(ReglaNegocioException.class);

        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Anular: repone el stock de cada producto y queda ANULADA")
    void anular() {
        Venta venta = venta(EstadoVenta.PAGADA);
        when(ventaRepository.findWithDetallesById(1L)).thenReturn(Optional.of(venta));

        VentaResponse respuesta = ventaService.cambiarEstado(1L, new EstadoVentaRequest(EstadoVenta.ANULADA));

        assertThat(respuesta.getEstado()).isEqualTo(EstadoVenta.ANULADA);
        verify(catalogoClient).reponerStock(1L, 1);
        verify(catalogoClient).reponerStock(2L, 3);
        verify(ventaRepository).save(venta);
    }

    @Test
    @DisplayName("Anular con fallo a mitad: revierte lo repuesto y la venta sigue PAGADA")
    void anularConFallo() {
        Venta venta = venta(EstadoVenta.PAGADA);
        when(ventaRepository.findWithDetallesById(1L)).thenReturn(Optional.of(venta));
        doNothing().when(catalogoClient).reponerStock(1L, 1);
        doThrow(new ServicioNoDisponibleException("El catálogo no está disponible"))
                .when(catalogoClient).reponerStock(2L, 3);

        assertThatThrownBy(() -> ventaService.cambiarEstado(1L, new EstadoVentaRequest(EstadoVenta.ANULADA)))
                .isInstanceOf(ServicioNoDisponibleException.class);

        verify(catalogoClient).descontarStock(1L, 1);
        assertThat(venta.getEstado()).isEqualTo(EstadoVenta.PAGADA);
        verify(ventaRepository, never()).save(any());
    }

    private ItemVentaRequest item(Long productoId, int cantidad) {
        return new ItemVentaRequest(productoId, cantidad);
    }

    private VentaRequest retiro(ItemVentaRequest... items) {
        VentaRequest request = new VentaRequest();
        request.setItems(List.of(items));
        request.setTipoEntrega(TipoEntrega.RETIRO_EN_TIENDA);
        return request;
    }

    private VentaRequest despacho(String comuna, ItemVentaRequest... items) {
        VentaRequest request = new VentaRequest();
        request.setItems(List.of(items));
        request.setTipoEntrega(TipoEntrega.DESPACHO_A_DOMICILIO);
        request.setDireccionDespacho("Av. Francisco de Aguirre 123");
        request.setComunaDespacho(comuna);
        return request;
    }

    private Venta venta(EstadoVenta estado) {
        Venta venta = new Venta();
        venta.setId(1L);
        venta.setUsuarioId(5L);
        venta.setEstado(estado);
        venta.setTipoEntrega(TipoEntrega.RETIRO_EN_TIENDA);
        venta.setSubtotal(36_000L);
        venta.setCostoDespacho(0L);
        venta.setTotal(36_000L);
        venta.agregarDetalle(detalle(1L, "Taladro", 30_000, 1));
        venta.agregarDetalle(detalle(2L, "Brocha", 2_000, 3));
        return venta;
    }

    private DetalleVenta detalle(Long productoId, String nombre, int precio, int cantidad) {
        DetalleVenta detalle = new DetalleVenta();
        detalle.setProductoId(productoId);
        detalle.setNombreProducto(nombre);
        detalle.setPrecioUnitario(precio);
        detalle.setCantidad(cantidad);
        detalle.setSubtotal((long) precio * cantidad);
        return detalle;
    }
}
