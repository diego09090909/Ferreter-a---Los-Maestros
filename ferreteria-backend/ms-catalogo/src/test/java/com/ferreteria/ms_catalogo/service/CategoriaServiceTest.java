package com.ferreteria.ms_catalogo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ferreteria.ms_catalogo.dto.CategoriaRequest;
import com.ferreteria.ms_catalogo.dto.CategoriaResponse;
import com.ferreteria.ms_catalogo.exception.RecursoNoEncontradoException;
import com.ferreteria.ms_catalogo.exception.ReglaNegocioException;
import com.ferreteria.ms_catalogo.mapper.CategoriaMapper;
import com.ferreteria.ms_catalogo.model.Categoria;
import com.ferreteria.ms_catalogo.repository.CategoriaRepository;
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
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Spy
    private CategoriaMapper categoriaMapper;

    @InjectMocks
    private CategoriaService categoriaService;

    private Categoria categoria;

    @BeforeEach
    void setUp() {
        categoria = new Categoria(1L, "Herramientas", "Herramientas Manuales y Eléctricas", "Martillos, taladros");
    }

    @Test
    @DisplayName("listar devuelve todas las categorias")
    void listarCategorias() {
        when(categoriaRepository.findAll()).thenReturn(List.of(categoria));

        List<CategoriaResponse> respuesta = categoriaService.listar();

        assertThat(respuesta).hasSize(1);
        assertThat(respuesta.get(0).getNombre()).isEqualTo("Herramientas");
    }

    @Test
    @DisplayName("crear guarda la categoria con el nombre sin espacios sobrantes")
    void crearCategoriaValida() {
        when(categoriaRepository.existsByNombre("Jardineria")).thenReturn(false);
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(inv -> inv.getArgument(0));

        CategoriaResponse respuesta = categoriaService.crear(
                new CategoriaRequest("  Jardineria ", "Jardinería y Exterior", "Mangueras, palas"));

        assertThat(respuesta.getNombre()).isEqualTo("Jardineria");
        assertThat(respuesta.getEtiqueta()).isEqualTo("Jardinería y Exterior");
        verify(categoriaRepository).save(any(Categoria.class));
    }

    @Test
    @DisplayName("crear rechaza un nombre de categoria que ya existe")
    void crearNombreDuplicado() {
        when(categoriaRepository.existsByNombre("Herramientas")).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.crear(
                new CategoriaRequest("Herramientas", "Otra etiqueta", "Otra descripcion")))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessageContaining("Herramientas");
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    @DisplayName("actualizar rechaza un nombre que ya usa otra categoria")
    void actualizarNombreDeOtraCategoria() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.existsByNombreAndIdNot("Pinturas", 1L)).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.actualizar(1L,
                new CategoriaRequest("Pinturas", "Pinturas y Recubrimientos", "Latex")))
                .isInstanceOf(ReglaNegocioException.class);
        assertThat(categoria.getNombre()).isEqualTo("Herramientas");
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    @DisplayName("eliminar no deja borrar una categoria que tiene productos")
    void eliminarCategoriaConProductos() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.existsByCategoriaId(1L)).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.eliminar(1L))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("No se puede eliminar la categoria porque tiene productos asociados");
        verify(categoriaRepository, never()).delete(any());
    }

    @Test
    @DisplayName("eliminar borra una categoria sin productos")
    void eliminarCategoriaVacia() {
        when(categoriaRepository.findById(1L)).thenReturn(Optional.of(categoria));
        when(productoRepository.existsByCategoriaId(1L)).thenReturn(false);

        categoriaService.eliminar(1L);

        verify(categoriaRepository).delete(categoria);
    }

    @Test
    @DisplayName("obtener lanza error si la categoria no existe")
    void obtenerCategoriaInexistente() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoriaService.obtener(99L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessage("No existe la categoria con id 99");
    }
}