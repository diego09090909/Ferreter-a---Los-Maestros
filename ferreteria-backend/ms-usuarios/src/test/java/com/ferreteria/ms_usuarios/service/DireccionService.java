package com.ferreteria.ms_usuarios.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.DireccionRepository;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DireccionService {

    private static final int MAX_DIRECCIONES = 5;

    private final DireccionRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final DireccionMapper direccionMapper;


    @Transactional(readOnly = true)
    public List<DireccionResponse> listar(Long usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId).stream()
                .sorted(Comparator.comparing(Direccion::isPredeterminada).reversed()
                        .thenComparing(Direccion::getId))
                .map(direccionMapper::aResponse)
                .toList();
    }


    @Transactional
    public DireccionResponse agregar(Long usuarioId, DireccionRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        long cantidad = direccionRepository.countByUsuarioId(usuarioId);
        if (cantidad >= MAX_DIRECCIONES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Puedes guardar hasta " + MAX_DIRECCIONES + " direcciones");
        }

        Direccion direccion = direccionMapper.aEntidad(req);
        direccion.setPredeterminada(cantidad == 0); 
        usuario.addDireccion(direccion);

        return direccionMapper.aResponse(direccionRepository.save(direccion));
    }

    @Transactional
    public DireccionResponse actualizar(Long usuarioId, Long direccionId, DireccionRequest req) {
        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        direccionMapper.actualizar(direccion, req);

        return direccionMapper.aResponse(direccionRepository.save(direccion));
    }

    @Transactional
    public void eliminar(Long usuarioId, Long direccionId) {
        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        boolean eraPredeterminada = direccion.isPredeterminada();
        direccionRepository.delete(direccion);


        if (eraPredeterminada) {
            direccionRepository.findByUsuarioId(usuarioId).stream()
                    .filter(d -> !d.getId().equals(direccionId))
                    .findFirst()
                    .ifPresent(d -> d.setPredeterminada(true));
        }
    }

    @Transactional
    public DireccionResponse marcarPredeterminada(Long usuarioId, Long direccionId) {
        Direccion elegida = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

 
        direccionRepository.findByUsuarioId(usuarioId)
                .forEach(d -> d.setPredeterminada(d.getId().equals(direccionId)));

        return direccionMapper.aResponse(elegida);
    }
}