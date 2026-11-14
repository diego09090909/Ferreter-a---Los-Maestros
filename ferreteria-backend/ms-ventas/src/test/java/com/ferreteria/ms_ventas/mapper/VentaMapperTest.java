package com.ferreteria.ms_ventas.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.ferreteria.ms_ventas.client.ProductoCatalogo;
import com.ferreteria.ms_ventas.dto.VentaResponse;
import com.ferreteria.ms_ventas.model.DetalleVenta;
import com.ferreteria.ms_ventas.model.EstadoVenta;
import com.ferreteria.ms_ventas.model.TipoEntrega;
import com.ferreteria.ms_ventas.model.Venta;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class VentaMapperTest {
    private final VentaMapper mapper = new VentaMapper();

    @Test
    @DisplayName("aDetalle guarda una foto del producto y calcula el subtotal")
    void aDetalle() {
        ProductoCatalogo taladro = new ProductoCatalogo(1L, "Taladro", 30_000, 10, true);

        DetalleVenta detalle = mapper.aDetalle(taladro, 3);

        assertThat(detalle.getProductoId()).isEqualTo(1L);
        assertThat(detalle.getNombreProducto()).isEqualTo("Taladro");
        assertThat(detalle.getPrecioUnitario()).isEqualTo(30_000);
        assertThat(detalle.getCantidad()).isEqualTo(3);
        assertThat(detalle.getSubtotal()).isEqualTo(90_000);
    }

    @Test
    @DisplayName("aResponse copia todos los campos de la venta y de sus detalles")
    void aResponse() {
        Venta venta = new Venta();
        venta.setId(7L);
        venta.setUsuarioId(5L);
        venta.setEstado(EstadoVenta.PAGADA);
        venta.setTipoEntrega(TipoEntrega.DESPACHO_A_DOMICILIO);
        venta.setDireccionDespacho("Av. Francisco de Aguirre 123");
        venta.setComunaDespacho("La Serena");
        venta.setSubtotal(30_000L);
        venta.setCostoDespacho(3_990L);
        venta.setTotal(33_990L);
        venta.agregarDetalle(mapper.aDetalle(new ProductoCatalogo(1L, "Taladro", 30_000, 10, true), 1));

        VentaResponse respuesta = mapper.aResponse(venta);

        assertThat(respuesta.getId()).isEqualTo(7L);
        assertThat(respuesta.getUsuarioId()).isEqualTo(5L);
        assertThat(respuesta.getEstado()).isEqualTo(EstadoVenta.PAGADA);
        assertThat(respuesta.getComunaDespacho()).isEqualTo("La Serena");
        assertThat(respuesta.getCostoDespacho()).isEqualTo(3_990L);
        assertThat(respuesta.getTotal()).isEqualTo(33_990L);
        assertThat(respuesta.getDetalles()).hasSize(1);
        assertThat(respuesta.getDetalles().get(0).getNombreProducto()).isEqualTo("Taladro");
    }
}
