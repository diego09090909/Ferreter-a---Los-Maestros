package com.ferreteria.ms_usuarios.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.LoginRequest;
import com.ferreteria.ms_usuarios.dto.RegistroRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.mapper.UsuarioMapper;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final DireccionMapper direccionMapper;

    @Transactional
    public UsuarioResponse registrar(RegistroRequest req) {
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
        usuario.setRol(Rol.CLIENTE);

        if (req.getDireccion() != null) {
            Direccion dir = direccionMapper.aEntidad(req.getDireccion());
            dir.setPredeterminada(true);
            usuario.addDireccion(dir);
        }

        return usuarioMapper.aResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse login(LoginRequest req) {
        String identificador = req.getUsuario().trim();
        String email = identificador.toLowerCase();
        String rut = identificador.replace(".", "").toUpperCase();

        Usuario usuario = usuarioRepository.findByEmailOrRut(email, rut)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        return usuarioMapper.aResponse(usuario);
    }

    @Transactional
    public void actualizarContrasena(Long usuarioId, CambiarPasswordRequest req) {
        String passwordOld = req.getPasswordActual();
        String passwordNew = req.getPasswordNueva();

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!passwordEncoder.matches(passwordOld, usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contraseña actual es incorrecta");
        }
        if (passwordOld.equals(passwordNew)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La nueva contraseña no puede ser igual a la actual");
        }

        usuario.setPassword(passwordEncoder.encode(passwordNew));
        usuarioRepository.save(usuario);
    }
}