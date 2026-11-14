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

import com.ferreteria.ms_usuarios.dto.ActualizarUsuarioRequest;
import com.ferreteria.ms_usuarios.dto.CrearUsuarioRequest;
import com.ferreteria.ms_usuarios.mapper.UsuarioMapper;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UsuarioRepository usuarioRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UsuarioMapper usuarioMapper;

    @InjectMocks private AdminService adminService;

    private Usuario usuario(Long id, String rut, Rol rol) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setRut(rut);
        u.setEmail("u" + id + "@test.cl");
        u.setNombre("Usuario " + id);
        u.setRol(rol);
        return u;
    }

    private CrearUsuarioRequest crearReq(Rol rol) {
        CrearUsuarioRequest req = new CrearUsuarioRequest();
        req.setNombre("Juan Vendedor");
        req.setEmail("Vendedor@Ferreteria.cl");
        req.setRut("22222222-2");
        req.setPassword("Clave1234");
        req.setRol(rol);
        return req;
    }

    private ActualizarUsuarioRequest actualizarReq(Rol rol) {
        ActualizarUsuarioRequest req = new ActualizarUsuarioRequest();
        req.setNombre("Nombre Nuevo");
        req.setEmail("nuevo@test.cl");
        req.setRol(rol);
        return req;
    }

    @Test
    void crearUsuario_rolCliente_lanza400() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.crearUsuario(crearReq(Rol.CLIENTE)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void crearUsuario_emailDuplicado_lanza409() {
        when(usuarioRepository.existsByEmail("vendedor@ferreteria.cl")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.crearUsuario(crearReq(Rol.VENDEDOR)));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void crearUsuario_datosValidos_guardaConPasswordEncriptada() {
        when(usuarioRepository.existsByEmail(any())).thenReturn(false);
        when(usuarioRepository.existsByRut(any())).thenReturn(false);
        when(passwordEncoder.encode("Clave1234")).thenReturn("hash");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        adminService.crearUsuario(crearReq(Rol.VENDEDOR));

        org.mockito.ArgumentCaptor<Usuario> captor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertEquals(Rol.VENDEDOR, captor.getValue().getRol());
        assertEquals("hash", captor.getValue().getPassword());
        assertEquals("vendedor@ferreteria.cl", captor.getValue().getEmail());
    }

    @Test
    void eliminarUsuario_inexistente_lanza404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.eliminarUsuario(99L, 1L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void eliminarUsuario_adminGeneral_lanza403() {
        Usuario general = usuario(1L, AdminService.RUT_ADMIN_GENERAL, Rol.ADMIN);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(general));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.eliminarUsuario(1L, 5L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void eliminarUsuario_propiaCuenta_lanza400() {
        Usuario otroAdmin = usuario(5L, "33333333-3", Rol.ADMIN);
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(otroAdmin));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.eliminarUsuario(5L, 5L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void eliminarUsuario_valido_eliminaUsuario() {
        Usuario vendedor = usuario(7L, "44444444-4", Rol.VENDEDOR);
        when(usuarioRepository.findById(7L)).thenReturn(Optional.of(vendedor));

        adminService.eliminarUsuario(7L, 1L);

        verify(usuarioRepository).delete(vendedor);
    }

    @Test
    void actualizarUsuario_adminGeneralPorOtroAdmin_lanza403() {
        Usuario general = usuario(1L, AdminService.RUT_ADMIN_GENERAL, Rol.ADMIN);
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(general));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.actualizarUsuario(1L, actualizarReq(Rol.ADMIN), 5L));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarUsuario_cambiarPropioRol_lanza400() {
        Usuario otroAdmin = usuario(5L, "33333333-3", Rol.ADMIN);
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(otroAdmin));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.actualizarUsuario(5L, actualizarReq(Rol.VENDEDOR), 5L));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarUsuario_emailDeOtro_lanza409() {
        Usuario vendedor = usuario(7L, "44444444-4", Rol.VENDEDOR);
        when(usuarioRepository.findById(7L)).thenReturn(Optional.of(vendedor));
        when(usuarioRepository.existsByEmailAndIdNot("nuevo@test.cl", 7L)).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> adminService.actualizarUsuario(7L, actualizarReq(Rol.VENDEDOR), 1L));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void actualizarUsuario_datosValidos_actualizaNombreEmailYRol() {
        Usuario vendedor = usuario(7L, "44444444-4", Rol.VENDEDOR);
        when(usuarioRepository.findById(7L)).thenReturn(Optional.of(vendedor));
        when(usuarioRepository.existsByEmailAndIdNot("nuevo@test.cl", 7L)).thenReturn(false);
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

        adminService.actualizarUsuario(7L, actualizarReq(Rol.ADMIN), 1L);

        assertEquals("Nombre Nuevo", vendedor.getNombre());
        assertEquals("nuevo@test.cl", vendedor.getEmail());
        assertEquals(Rol.ADMIN, vendedor.getRol());
    }
}