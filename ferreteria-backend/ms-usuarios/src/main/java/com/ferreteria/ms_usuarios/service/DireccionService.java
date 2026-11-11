package com.ferreteria.ms_usuarios.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.repository.DireccionRepository;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final DireccionMapper direccionMapper;

    @Transactional
    public DireccionResponse actualizarDireccion(Long usuarioId, Long direccionId, DireccionRequest req) {

        Direccion direccion = direccionRepository.findByIdAndUsuarioId(direccionId, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dirección no encontrada"));

        direccion.setCalle(req.getCalle());
        direccion.setNumero(req.getNumero());
        direccion.setComuna(req.getComuna());
        direccion.setCiudad(req.getCiudad());
        direccion.setRegion(req.getRegion());

        return direccionMapper.aResponse(direccionRepository.save(direccion));
    }


    
}
