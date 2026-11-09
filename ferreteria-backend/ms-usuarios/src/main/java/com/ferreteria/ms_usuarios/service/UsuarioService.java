package com.ferreteria.ms_usuarios.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.RegistroRequest;
import com.ferreteria.ms_usuarios.dto.UsuarioResponse;
import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Rol;
import com.ferreteria.ms_usuarios.model.Usuario;
import com.ferreteria.ms_usuarios.repository.UsuarioRepository;
import com.ferreteria.ms_usuarios.repository.RolRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;



@Service 
@RequiredArgsConstructor 
public class UsuarioService {
    
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder; 
    

    @Transactional 
    public UsuarioResponse registrar(RegistroRequest req){
        String email = req.getEmail().trim().toLowerCase();
        String rut = req.getRut().trim().replaceAll(".", "").toUpperCase();

        if(usuarioRepository.existsByEmail(email)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya esta registrado");    
        }
        if (usuarioRepository.existsByRut(rut)){
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El RUT ya esta registrado");    
        }

        Rol rolCliente = rolRepository.findByNombre("Cliente")
            .orElseThrow(() -> new IllegalStateException("Rol Cliente no existe"));

        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre().trim());
        usuario.setEmail(email);
        usuario.setRut(rut);
        usuario.setPassword(passwordEncoder.encode(req.getPassword()));
        usuario.setRol(rolCliente);

        if(req.getDireccion() != null) {
            DireccionRequest d = req.getDireccion();
            Direccion dir = new Direccion();
            dir.setCalle(d.getCalle());
            dir.setNumero(d.getNumero());
            dir.setComuna(d.getComuna());
            dir.setCiudad(d.getCiudad());
            dir.setRegion(d.getRegion());
            usuario.addDireccion(dir);

        }
        
        return UsuarioResponse.desde(usuarioRepository.save(usuario));
        
    }
}
