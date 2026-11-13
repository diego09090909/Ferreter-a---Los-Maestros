package com.ferreteria.ms_usuarios.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.ActualizarUsuarioRequest;
import com.ferreteria.ms_usuarios.dto.CrearUsuarioRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.mapper.UsuarioMapper;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll(Sort.by("id")).stream()
                .map(usuarioMapper::aResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return usuarioMapper.aResponse(usuario);
    }

    @Transactional
    public UsuarioResponse crearUsuario(CrearUsuarioRequest req) {
        if (req.getRol() == Rol.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los clientes se registran desde la tienda");
        }

        String email = req.getEmail().trim().toLowerCase();
        String rut = req.getRut().trim().replace(".", "").toUpperCase();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado");
        }
        if (usuarioRepository.existsByRut(rut)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El RUT ya esta registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre().trim());
        usuario.setEmail(email);
        usuario.setRut(rut);
        usuario.setPassword(passwordEncoder.encode(req.getPassword()));
        usuario.setRol(req.getRol());

        return usuarioMapper.aResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminarUsuario(Long id, Long adminId) {
        if (id.equals(adminId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No puedes eliminar tu propia cuenta");
        }
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuarioRepository.delete(usuario);
    }

    @Transactional
    public UsuarioResponse actualizarUsuario(Long id, ActualizarUsuarioRequest req, Long adminId) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (id.equals(adminId) && req.getRol() != usuario.getRol()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No puedes cambiar tu propio rol");
        }

        String email = req.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado");
        }

        usuario.setNombre(req.getNombre().trim());
        usuario.setEmail(email);
        usuario.setRol(req.getRol());

        return usuarioMapper.aResponse(usuarioRepository.save(usuario));
    }
}