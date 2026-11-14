package com.ferreteria.ms_ventas.service;

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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VentaService {
    private static final Logger log = LoggerFactory.getLogger(VentaService.class);

    private final VentaRepository ventaRepository;
    private final CatalogoClient catalogoClient;
    private final CalculadoraDespacho calculadoraDespacho;
    private final VentaMapper ventaMapper;

    public VentaResponse crear(Long usuarioId, VentaRequest request) {
        Map<Long, Integer> cantidades = agruparPorProducto(request.getItems());
        boolean conDespacho = request.getTipoEntrega() == TipoEntrega.DESPACHO_A_DOMICILIO;

        String comuna = conDespacho ? calculadoraDespacho.validarComuna(request.getComunaDespacho()) : null;

        Venta venta = new Venta();
        venta.setUsuarioId(usuarioId);
        venta.setTipoEntrega(request.getTipoEntrega());
        venta.setDireccionDespacho(conDespacho ? request.getDireccionDespacho().trim() : null);
        venta.setComunaDespacho(comuna);

        long subtotal = 0;
        for (Map.Entry<Long, Integer> item : cantidades.entrySet()) {
            ProductoCatalogo producto = catalogoClient.obtenerProducto(item.getKey());
            validarDatosDelCatalogo(producto);
            int cantidad = item.getValue();

            if (!Boolean.TRUE.equals(producto.getDisponible())) {
                throw new ReglaNegocioException("'" + producto.getNombre() + "' no está disponible");
            }
            if (producto.getStock() < cantidad) {
                throw new ReglaNegocioException("Stock insuficiente de '" + producto.getNombre()
                        + "': quedan " + producto.getStock() + " unidades");
            }

            DetalleVenta detalle = ventaMapper.aDetalle(producto, cantidad);
            venta.agregarDetalle(detalle);
            subtotal += detalle.getSubtotal();
        }

        long costoDespacho = conDespacho ? calculadoraDespacho.calcularCosto(comuna, subtotal) : 0;
        venta.setSubtotal(subtotal);
        venta.setCostoDespacho(costoDespacho);
        venta.setTotal(subtotal + costoDespacho);

        descontarStockConCompensacion(venta.getDetalles());

        try {
            Venta guardada = ventaRepository.save(venta);
            return ventaMapper.aResponse(guardada);
        } catch (RuntimeException e) {
            log.error("No se pudo guardar la venta; reponiendo stock descontado", e);
            reponerSinFallar(venta.getDetalles());
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarDelUsuario(Long usuarioId) {
        return ventaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(ventaMapper::aResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarTodas(EstadoVenta estado) {
        List<Venta> ventas = (estado == null)
                ? ventaRepository.findAllByOrderByFechaDesc()
                : ventaRepository.findByEstadoOrderByFechaDesc(estado);
        return ventas.stream().map(ventaMapper::aResponse).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Long ventaId) {
        return ventaMapper.aResponse(buscarVenta(ventaId));
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerDelUsuario(Long ventaId, Long usuarioId) {
        Venta venta = buscarVenta(ventaId);
        if (!venta.getUsuarioId().equals(usuarioId)) {
            throw new RecursoNoEncontradoException("Venta " + ventaId + " no encontrada");
        }
        return ventaMapper.aResponse(venta);
    }

    public VentaResponse cambiarEstado(Long ventaId, EstadoVentaRequest request) {
        Venta venta = buscarVenta(ventaId);
        EstadoVenta actual = venta.getEstado();
        EstadoVenta nuevo = request.getEstado();

        if (!actual.puedeCambiarA(nuevo)) {
            throw new ReglaNegocioException(
                    "No se puede cambiar una venta de " + actual + " a " + nuevo);
        }

        if (nuevo != EstadoVenta.ANULADA) {
            venta.setEstado(nuevo);
            ventaRepository.save(venta);
            return ventaMapper.aResponse(venta);
        }

        reponerStockConCompensacion(venta.getDetalles());

        try {
            venta.setEstado(EstadoVenta.ANULADA);
            ventaRepository.save(venta);
            return ventaMapper.aResponse(venta);
        } catch (RuntimeException e) {
            log.error("No se pudo guardar la anulación de la venta {}; revirtiendo stock", ventaId, e);
            descontarSinFallar(venta.getDetalles());
            throw e;
        }
    }

    private Venta buscarVenta(Long ventaId) {
        return ventaRepository.findWithDetallesById(ventaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Venta " + ventaId + " no encontrada"));
    }

    private Map<Long, Integer> agruparPorProducto(List<ItemVentaRequest> items) {
        Map<Long, Integer> cantidades = new LinkedHashMap<>();
        for (ItemVentaRequest item : items) {
            cantidades.merge(item.getProductoId(), item.getCantidad(), Integer::sum);
        }
        return cantidades;
    }

    private void validarDatosDelCatalogo(ProductoCatalogo producto) {
        if (producto.getId() == null || producto.getNombre() == null
                || producto.getPrecio() == null || producto.getStock() == null) {
            log.error("ms-catalogo devolvió un producto con datos incompletos: {}", producto);
            throw new ServicioNoDisponibleException(
                    "El catálogo devolvió datos incompletos, intente más tarde");
        }
    }

    private void descontarStockConCompensacion(List<DetalleVenta> detalles) {
        List<DetalleVenta> descontados = new ArrayList<>();
        try {
            for (DetalleVenta detalle : detalles) {
                catalogoClient.descontarStock(detalle.getProductoId(), detalle.getCantidad());
                descontados.add(detalle);
            }
        } catch (RuntimeException e) {
            reponerSinFallar(descontados);
            throw e;
        }
    }

    private void reponerStockConCompensacion(List<DetalleVenta> detalles) {
        List<DetalleVenta> repuestos = new ArrayList<>();
        try {
            for (DetalleVenta detalle : detalles) {
                catalogoClient.reponerStock(detalle.getProductoId(), detalle.getCantidad());
                repuestos.add(detalle);
            }
        } catch (RuntimeException e) {
            descontarSinFallar(repuestos);
            throw e;
        }
    }

    private void reponerSinFallar(List<DetalleVenta> detalles) {
        for (DetalleVenta detalle : detalles) {
            try {
                catalogoClient.reponerStock(detalle.getProductoId(), detalle.getCantidad());
            } catch (RuntimeException error) {
                log.error("COMPENSACIÓN FALLIDA: no se pudo reponer stock del producto {} ({} uds)",
                        detalle.getProductoId(), detalle.getCantidad(), error);
            }
        }
    }

    private void descontarSinFallar(List<DetalleVenta> detalles) {
        for (DetalleVenta detalle : detalles) {
            try {
                catalogoClient.descontarStock(detalle.getProductoId(), detalle.getCantidad());
            } catch (RuntimeException error) {
                log.error("COMPENSACIÓN FALLIDA: no se pudo volver a descontar stock del producto {} ({} uds)",
                        detalle.getProductoId(), detalle.getCantidad(), error);
            }
        }
    }
}
