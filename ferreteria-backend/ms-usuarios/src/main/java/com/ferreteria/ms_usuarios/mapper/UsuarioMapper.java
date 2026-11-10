package com.ferreteria.ms_usuarios.mapper;

import org.springframework.stereotype.Component;

import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.model.Usuario;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsuarioMapper {

    private final DireccionMapper direccionMapper;

   public UsuarioResponse aResponse(Usuario u) {
    return new UsuarioResponse(
            u.getId(), u.getNombre(), u.getRut(), u.getEmail(),
            u.getRol().name(),
            u.getDirecciones().stream().map(direccionMapper::aResponse).toList());
}
}