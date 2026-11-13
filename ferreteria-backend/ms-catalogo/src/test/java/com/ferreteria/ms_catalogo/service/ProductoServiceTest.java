package com.ferreteria.ms_catalogo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ferreteria.ms_catalogo.dto.ProductoAdminResponse;
import com.ferreteria.ms_catalogo.dto.ProductoRequest;
import com.ferreteria.ms_catalogo.dto.ProductoResponse;
import com.ferreteria.ms_catalogo.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_catalogo.exception.ReglaNegocioException;
import com.ferreteria.ms_catalogo.mapper.ProductoMapper;
import com.ferreteria.ms_catalogo.model.Categoria;
import com.ferreteria.ms_catalogo.model.Producto;
import com.ferreteria.ms_catalogo.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private CategoriaService categoriaService;

    @Spy
    private ProductoMapper productoMapper;

    @InjectMocks
    private ProductoService productoService;

    private Categoria categoria;
    private Producto producto;

    @BeforeEach
    void setUp() {
        categoria = new Categoria(1L, "Herramientas", "Herramientas Manuales y Eléctricas", "Martillos, taladros");
        producto = new Producto(4L, "HE001", "Martillo carpintero", "Martillo 16 oz", "Manuales",
                "Stanley", "UN", 5000, 8990, 10, 3, "sin-imagen.svg", categoria);
    }

    private ProductoRequest request(String codigo, int precioCompra, int precio) {
        return new ProductoRequest(codigo, "Taladro percutor", "Taladro 650W", "Eléctricas",
                "Bosch", "UN", precioCompra, precio, 15, 5, "sin-imagen.svg", 1L);
    }

    @Test
    @DisplayName("crear guarda el producto con el codigo en mayusculas y calcula el margen")
    void crearProductoValido() {
        when(productoRepository.existsByCodigo("HE099")).thenReturn(false);
        when(categoriaService.obtener(1L)).thenReturn(categoria);
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductoAdminResponse respuesta = productoService.crear(request(" he099 ", 30000, 45990));

        assertThat(respuesta.getCodigo()).isEqualTo("HE099");
        assertThat(respuesta.getMargen()).isEqualTo(15990);
        assertThat(respuesta.getCategoria()).isEqualTo("Herramientas");
        verify(productoRepository).save(any(Producto.class));
    }

    @Test
    @DisplayName("crear rechaza un codigo que ya existe")
    void crearCodigoDuplicado() {
        when(productoRepository.existsByCodigo("HE001")).thenReturn(true);

        assertThatThrownBy(() -> productoService.crear(request("HE001", 30000, 45990)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("HE001");
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("crear rechaza un precio de venta menor o igual al de compra")
    void crearPrecioInvalido() {
        when(productoRepository.existsByCodigo("HE099")).thenReturn(false);

        assertThatThrownBy(() -> productoService.crear(request("HE099", 45990, 45990)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("El precio de venta debe ser mayor al precio de compra");
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("actualizar rechaza un codigo que ya usa otro producto")
    void actualizarCodigoDeOtroProducto() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto));
        when(productoRepository.existsByCodigoAndIdNot("PI001", 4L)).thenReturn(true);

        assertThatThrownBy(() -> productoService.actualizar(4L, request("PI001", 5000, 8990)))
                .isInstanceOf(ReglaNegocioException.class);
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("buscarPorId lanza error si el producto no existe")
    void buscarProductoInexistente() {
        when(productoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.buscarPorId(999L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessage("No existe el producto con id 999");
    }

    @Test
    @DisplayName("descontarStock resta la cantidad pedida")
    void descontarStockValido() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(producto)).thenReturn(producto);

        ProductoResponse respuesta = productoService.descontarStock(4L, 3);

        assertThat(respuesta.getStock()).isEqualTo(7);
        assertThat(respuesta.getDisponible()).isTrue();
    }

    @Test
    @DisplayName("descontarStock deja el producto agotado si se lleva todo el stock")
    void descontarTodoElStock() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(producto)).thenReturn(producto);

        ProductoResponse respuesta = productoService.descontarStock(4L, 10);

        assertThat(respuesta.getStock()).isZero();
        assertThat(respuesta.getDisponible()).isFalse();
    }

    @Test
    @DisplayName("descontarStock rechaza una cantidad mayor al stock y no cambia nada")
    void descontarStockInsuficiente() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto));

        assertThatThrownBy(() -> productoService.descontarStock(4L, 11))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("Stock insuficiente");
        assertThat(producto.getStock()).isEqualTo(10);
        verify(productoRepository, never()).save(any());
    }

    @Test
    @DisplayName("reponerStock suma la cantidad al stock")
    void reponerStock() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(producto)).thenReturn(producto);

        ProductoResponse respuesta = productoService.reponerStock(4L, 5);

        assertThat(respuesta.getStock()).isEqualTo(15);
    }

    @Test
    @DisplayName("listar con categoria y texto usa el filtro combinado")
    void listarConFiltros() {
        when(productoRepository.findByCategoriaNombreAndNombreContainingIgnoreCase("Herramientas", "martillo"))
                .thenReturn(List.of(producto));

        List<ProductoResponse> respuesta = productoService.listar("Herramientas", "  martillo ");

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).getNombre()).isEqualTo("Martillo carpintero");
    }
}