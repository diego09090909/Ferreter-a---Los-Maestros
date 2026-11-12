package com.ferreteria.ms_ventas.service;

import com.ferreteria.ms_ventas.client.CatalogoClient;
import com.ferreteria.ms_ventas.client.ProductoCatalogo;
import com.ferreteria.ms_ventas.dto.EstadoVentaRequest;
import com.ferreteria.ms_ventas.dto.ItemVentaRequest;
import com.ferreteria.ms_ventas.dto.VentaRequest;
import com.ferreteria.ms_ventas.dto.VentaResponse;
import com.ferreteria.ms_ventas.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_ventas.exception.ReglaNegocioException;
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

    /**
     * @param usuarioId viene del token JWT (lo saca el controller), nunca del body.
     */
    @Transactional
    public VentaResponse crear(Long usuarioId, VentaRequest request) {
       
        Map<Long, Integer> cantidades = agruparPorProducto(request.getItems());

        Venta venta = new Venta();
        venta.setUsuarioId(usuarioId);
        venta.setTipoEntrega(request.getTipoEntrega());
        venta.setDireccionDespacho(
                request.getTipoEntrega() == TipoEntrega.DESPACHO_A_DOMICILIO
                        ? request.getDireccionDespacho().trim()
                        : null);

        long total = 0;
        for (Map.Entry<Long, Integer> item : cantidades.entrySet()) {
            ProductoCatalogo producto = catalogoClient.obtenerProducto(item.getKey());
            int cantidad = item.getValue();

            if (!Boolean.TRUE.equals(producto.getDisponible())) {
                throw new ReglaNegocioException("'" + producto.getNombre() + "' no está disponible");
            }

            if (producto.getStock() < cantidad) {
                throw new ReglaNegocioException("Stock insuficiente de '" + producto.getNombre()
                        + "': quedan " + producto.getStock() + " unidades");
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProductoId(producto.getId());
            detalle.setNombreProducto(producto.getNombre());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setCantidad(cantidad);
            detalle.setSubtotal((long) producto.getPrecio() * cantidad);

            venta.agregarDetalle(detalle);
            total += detalle.getSubtotal();
        }
        venta.setTotal(total);

        descontarStockConCompensacion(venta.getDetalles());

        Venta guardada = ventaRepository.save(venta);
        return VentaResponse.desde(guardada);
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarDelUsuario(Long usuarioId) {
        return ventaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(VentaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VentaResponse> listarTodas(EstadoVenta estado) {
        List<Venta> ventas = (estado == null)
                ? ventaRepository.findAllByOrderByFechaDesc()
                : ventaRepository.findByEstadoOrderByFechaDesc(estado);
        return ventas.stream().map(VentaResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Long ventaId) {
        return VentaResponse.desde(buscarVenta(ventaId));
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerDelUsuario(Long ventaId, Long usuarioId) {
        Venta venta = buscarVenta(ventaId);
        if (!venta.getUsuarioId().equals(usuarioId)) {
            throw new RecursoNoEncontradoException("Venta " + ventaId + " no encontrada");
        }
        return VentaResponse.desde(venta);
    }

    @Transactional
    public VentaResponse cambiarEstado(Long ventaId, EstadoVentaRequest request) {
        Venta venta = buscarVenta(ventaId);
        EstadoVenta actual = venta.getEstado();
        EstadoVenta nuevo = request.getEstado();

        if (!actual.puedeCambiarA(nuevo)) {
            throw new ReglaNegocioException(
                    "No se puede cambiar una venta de " + actual + " a " + nuevo);
        }

        
        if (nuevo == EstadoVenta.ANULADA) {
            for (DetalleVenta detalle : venta.getDetalles()) {
                catalogoClient.reponerStock(detalle.getProductoId(), detalle.getCantidad());
            }
        }

        venta.setEstado(nuevo);
                
        return VentaResponse.desde(venta);
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

    private void descontarStockConCompensacion(List<DetalleVenta> detalles) {
        List<DetalleVenta> descontados = new ArrayList<>();
        try {
            for (DetalleVenta detalle : detalles) {
                catalogoClient.descontarStock(detalle.getProductoId(), detalle.getCantidad());
                descontados.add(detalle);
            }
        } catch (RuntimeException e) {
            for (DetalleVenta detalle : descontados) {
                try {
                    catalogoClient.reponerStock(detalle.getProductoId(), detalle.getCantidad());
                } catch (RuntimeException errorAlReponer) {
                    
                    log.error("No se pudo reponer stock del producto {} ({} uds)",
                            detalle.getProductoId(), detalle.getCantidad(), errorAlReponer);
                }
            }
            throw e;
        }
    }
}
