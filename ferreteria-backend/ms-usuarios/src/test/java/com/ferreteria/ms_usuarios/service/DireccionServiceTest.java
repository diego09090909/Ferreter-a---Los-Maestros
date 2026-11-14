package com.ferreteria.ms_usuarios.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.DireccionRepository;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class DireccionServiceTest {

    @Mock private DireccionRepository direccionRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private DireccionMapper direccionMapper;

    @InjectMocks private DireccionService direccionService;

    private Direccion direccion(Long id, boolean predeterminada) {
        Direccion d = new Direccion();
        d.setId(id);
        d.setPredeterminada(predeterminada);
        return d;
    }

    @Test
    void agregar_usuarioInexistente_lanza404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> direccionService.agregar(99L, new DireccionRequest()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(direccionRepository, never()).save(any());
    }

    @Test
    void agregar_conCincoDirecciones_lanza400() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(new Usuario()));
        when(direccionRepository.countByUsuarioId(1L)).thenReturn(5L);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> direccionService.agregar(1L, new DireccionRequest()));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(direccionRepository, never()).save(any());
    }

    @Test
    void agregar_primeraDireccion_quedaPredeterminada() {
        Direccion nueva = direccion(null, false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(new Usuario()));
        when(direccionRepository.countByUsuarioId(1L)).thenReturn(0L);
        when(direccionMapper.aEntidad(any())).thenReturn(nueva);
        when(direccionRepository.save(any(Direccion.class))).thenAnswer(i -> i.getArgument(0));

        direccionService.agregar(1L, new DireccionRequest());

        assertTrue(nueva.isPredeterminada());
        verify(direccionRepository).save(nueva);
    }

    @Test
    void agregar_segundaDireccion_noEsPredeterminada() {
        Direccion nueva = direccion(null, false);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(new Usuario()));
        when(direccionRepository.countByUsuarioId(1L)).thenReturn(1L);
        when(direccionMapper.aEntidad(any())).thenReturn(nueva);
        when(direccionRepository.save(any(Direccion.class))).thenAnswer(i -> i.getArgument(0));

        direccionService.agregar(1L, new DireccionRequest());

        assertFalse(nueva.isPredeterminada());
    }

    @Test
    void actualizar_noExiste_lanza404() {
        when(direccionRepository.findByIdAndUsuarioId(9L, 1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> direccionService.actualizar(1L, 9L, new DireccionRequest()));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(direccionRepository, never()).save(any());
    }

    @Test
    void actualizar_valida_guardaCambios() {
        Direccion existente = direccion(3L, false);
        DireccionRequest req = new DireccionRequest();
        when(direccionRepository.findByIdAndUsuarioId(3L, 1L)).thenReturn(Optional.of(existente));
        when(direccionRepository.save(existente)).thenReturn(existente);

        direccionService.actualizar(1L, 3L, req);

        verify(direccionMapper).actualizar(existente, req);
        verify(direccionRepository).save(existente);
    }

    @Test
    void eliminar_noExiste_lanza404() {
        when(direccionRepository.findByIdAndUsuarioId(9L, 1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> direccionService.eliminar(1L, 9L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(direccionRepository, never()).delete(any());
    }

    @Test
    void eliminar_noPredeterminada_soloElimina() {
        Direccion d = direccion(2L, false);
        when(direccionRepository.findByIdAndUsuarioId(2L, 1L)).thenReturn(Optional.of(d));

        direccionService.eliminar(1L, 2L);

        verify(direccionRepository).delete(d);
        verify(direccionRepository, never()).findByUsuarioId(any());
    }

    @Test
    void eliminar_predeterminada_reasignaOtraComoPredeterminada() {
        Direccion eliminada = direccion(1L, true);
        Direccion otra = direccion(2L, false);
        when(direccionRepository.findByIdAndUsuarioId(1L, 10L)).thenReturn(Optional.of(eliminada));
        when(direccionRepository.findByUsuarioId(10L)).thenReturn(List.of(eliminada, otra));

        direccionService.eliminar(10L, 1L);

        verify(direccionRepository).delete(eliminada);
        assertTrue(otra.isPredeterminada());
    }

    @Test
    void marcarPredeterminada_noExiste_lanza404() {
        when(direccionRepository.findByIdAndUsuarioId(9L, 1L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> direccionService.marcarPredeterminada(1L, 9L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void marcarPredeterminada_valida_dejaSoloUnaPredeterminada() {
        Direccion d1 = direccion(1L, true);
        Direccion d2 = direccion(2L, false);
        when(direccionRepository.findByIdAndUsuarioId(2L, 10L)).thenReturn(Optional.of(d2));
        when(direccionRepository.findByUsuarioId(10L)).thenReturn(List.of(d1, d2));

        direccionService.marcarPredeterminada(10L, 2L);

        assertFalse(d1.isPredeterminada());
        assertTrue(d2.isPredeterminada());
    }
}