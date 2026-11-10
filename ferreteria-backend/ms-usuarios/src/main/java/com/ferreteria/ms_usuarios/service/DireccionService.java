package com.ferreteria.ms_usuarios.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.CambiarDireccionRequest;
import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;
import jakarta.validation.constraints.Size;

public class DireccionService {

    @Transactional
    public void actualizarDireccion(Long usuarioId, CambiarDireccionRequest req) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String calleActual = req.getCalleActual();
        String calleNueva = req.getCalleNueva();

        String numeroActual = req.getNumeroActual();
        String numeroNuevo = req.getNumeroNuevo();

        String comunaActual = req.getComunaActual();
        String comunaNueva = req.getComunaNueva();

        String ciudadActual = req.getCiudadActual();
        String ciudadNueva = req.getCiudadNueva();

        String regionActual = req.getRegionActual();
        String regionNueva = req.getRegionNueva();

        String indicacionesActuales = req.getIndicacionesActuales();
        String indicacionesNuevas = req.getIndicacionesNuevas();

    }

}
