package main.java.com.ferreteria.ms_usuarios.dto;

import com.ferreteria.ms_usuarios.model.Direccion;
import com.ferreteria.ms_usuarios.model.Usuario;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String rut;
    private String email;
    private String rol;
    private List<Direccion> direcciones;

    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getRut(),
                usuario.getEmail(),
                usuario.getRol().getNombre(),
                new ArrayList<>(usuario.getDirecciones()));
    }
}