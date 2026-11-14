package com.ferreteria.ms_usuarios.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.ferreteria.ms_usuarios.dto.AuthResponse;
import com.ferreteria.ms_usuarios.dto.CambiarPasswordRequest;
import com.ferreteria.ms_usuarios.dto.LoginRequest;
import com.ferreteria.ms_usuarios.dto.RegistroRequest;
import com.ferreteria.ms_usuarios.mapper.DireccionMapper;
import com.ferreteria.ms_usuarios.mapper.UsuarioMapper;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;
import com.ferreteria.ms_usuarios.security.JwtService;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UsuarioMapper usuarioMapper;
    @Mock
    private DireccionMapper direccionMapper;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuarioConPassword() {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setEmail("cliente@test.cl");
        u.setRut("16543210-K");
        u.setPassword("hash");
        u.setRol(Rol.CLIENTE);
        return u;
    }

    @Test
    void registrar_emailDuplicado_lanza409() {
        RegistroRequest req = new RegistroRequest();
        req.setNombre("Cliente");
        req.setEmail("Cliente@Test.cl");
        req.setRut("16543210-K");
        req.setPassword("Clave1234");

        when(usuarioRepository.existsByEmail("cliente@test.cl")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.registrar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrar_rutDuplicado_lanza409() {
        RegistroRequest req = new RegistroRequest();
        req.setNombre("Cliente");
        req.setEmail("cliente@test.cl");
        req.setRut("16.543.210-k");
        req.setPassword("Clave1234");

        when(usuarioRepository.existsByEmail("cliente@test.cl")).thenReturn(false);
        when(usuarioRepository.existsByRut("16543210-K")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.registrar(req));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void registrar_datosValidos_creaClienteConPasswordEncriptada() {
        RegistroRequest req = new RegistroRequest();
        req.setNombre("Cliente");
        req.setEmail("cliente@test.cl");
        req.setRut("16543210-K");
        req.setPassword("Clave1234");

        when(usuarioRepository.existsByEmail(any())).thenReturn(false);
        when(usuarioRepository.existsByRut(any())).thenReturn(false);
        when(passwordEncoder.encode("Clave1234")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));
        when(jwtService.generarAccessToken(any())).thenReturn("access");
        when(jwtService.generarRefreshToken(any())).thenReturn("refresh");

        AuthResponse res = usuarioService.registrar(req);

        org.mockito.ArgumentCaptor<Usuario> captor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertEquals(Rol.CLIENTE, captor.getValue().getRol());
        assertEquals("hash", captor.getValue().getPassword());
        assertEquals("cliente@test.cl", captor.getValue().getEmail());
    }

    @Test
    void login_usuarioInexistente_lanza401() {
        LoginRequest req = new LoginRequest();
        req.setUsuario("noexiste@test.cl");
        req.setPassword("cualquiera");

        when(usuarioRepository.findByEmailOrRut(any(), any())).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.login(req));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void login_passwordIncorrecta_lanza401() {
        LoginRequest req = new LoginRequest();
        req.setUsuario("cliente@test.cl");
        req.setPassword("incorrecta");

        Usuario u = usuarioConPassword();
        when(usuarioRepository.findByEmailOrRut(any(), any())).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("incorrecta", "hash")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.login(req));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(jwtService, never()).generarAccessToken(any());
    }

    @Test
    void login_credencialesCorrectas_generaTokens() {
        LoginRequest req = new LoginRequest();
        req.setUsuario("cliente@test.cl");
        req.setPassword("Clave1234");

        Usuario u = usuarioConPassword();
        when(usuarioRepository.findByEmailOrRut(any(), any())).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("Clave1234", "hash")).thenReturn(true);
        when(jwtService.generarAccessToken(u)).thenReturn("access");
        when(jwtService.generarRefreshToken(u)).thenReturn("refresh");

        AuthResponse res = usuarioService.login(req);

        assertEquals("access", res.getToken());
        assertEquals("refresh", res.getRefreshToken());
    }

    @Test
    void actualizarContrasena_usuarioInexistente_lanza404() {
        CambiarPasswordRequest req = new CambiarPasswordRequest();
        req.setPasswordActual("a");
        req.setPasswordNueva("b");

        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.actualizarContrasena(99L, req));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void actualizarContrasena_actualIncorrecta_lanza401() {
        CambiarPasswordRequest req = new CambiarPasswordRequest();
        req.setPasswordActual("incorrecta");
        req.setPasswordNueva("Nueva1234");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioConPassword()));
        when(passwordEncoder.matches("incorrecta", "hash")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.actualizarContrasena(1L, req));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarContrasena_nuevaIgualActual_lanza400() {
        CambiarPasswordRequest req = new CambiarPasswordRequest();
        req.setPasswordActual("Clave1234");
        req.setPasswordNueva("Clave1234");

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuarioConPassword()));
        when(passwordEncoder.matches("Clave1234", "hash")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> usuarioService.actualizarContrasena(1L, req));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarContrasena_datosValidos_guardaNuevaPasswordEncriptada() {
        CambiarPasswordRequest req = new CambiarPasswordRequest();
        req.setPasswordActual("Clave1234");
        req.setPasswordNueva("Nueva1234");

        Usuario u = usuarioConPassword();
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(u));
        when(passwordEncoder.matches("Clave1234", "hash")).thenReturn(true);
        when(passwordEncoder.encode("Nueva1234")).thenReturn("hashNuevo");

        usuarioService.actualizarContrasena(1L, req);

        assertEquals("hashNuevo", u.getPassword());
        verify(usuarioRepository).save(u);
    }
}