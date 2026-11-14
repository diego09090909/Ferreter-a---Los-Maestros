package com.ferreteria.ms_usuarios.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.AuthResponse;
import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.LoginRequest;
import com.ferreteria.ms_usuarios.dto.PerfilRequest;
import com.ferreteria.ms_usuarios.dto.RefreshRequest;
import com.ferreteria.ms_usuarios.dto.RegistroRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.mapper.UsuarioMapper;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;
import com.ferreteria.ms_usuarios.security.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final DireccionMapper direccionMapper;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse registrar(RegistroRequest req) {
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

        Usuario guardado = usuarioRepository.save(usuario);
        return construirAuth(guardado);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String identificador = req.getUsuario().trim();
        String email = identificador.toLowerCase();
        String rut = identificador.replace(".", "").toUpperCase();

        Usuario usuario = usuarioRepository.findByEmailOrRut(email, rut)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!passwordEncoder.matches(req.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        return construirAuth(usuario);
    }

    @Transactional(readOnly = true)
    public AuthResponse renovar(RefreshRequest req) {
        Claims claims;
        try {
            claims = jwtService.validarRefreshToken(req.getRefreshToken());
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de renovación inválido o vencido");
        }

        Number id = claims.get("id", Number.class);
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de renovación inválido o vencido");
        }

        Usuario usuario = usuarioRepository.findById(id.longValue())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Token de renovación inválido o vencido"));

        return construirAuth(usuario);
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

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return usuarioMapper.aResponse(usuario);
    }

    @Transactional
    public UsuarioResponse actualizarPerfil(Long usuarioId, PerfilRequest req) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String email = req.getEmail().trim().toLowerCase();

        if (usuarioRepository.existsByEmailAndIdNot(email, usuarioId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado");
        }

        usuario.setNombre(req.getNombre().trim());
        usuario.setEmail(email);

        return usuarioMapper.aResponse(usuarioRepository.save(usuario));
    }

    private AuthResponse construirAuth(Usuario usuario) {
        return new AuthResponse(
                jwtService.generarAccessToken(usuario),
                jwtService.generarRefreshToken(usuario),
                "Bearer",
                jwtService.getAccessExpirationMs(),
                usuarioMapper.aResponse(usuario));
    }
}