package main.java.com.ferreteria.ms_usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Debe ingresar su email o RUT")
    private String usuario;

    @NotBlank(message = "Debe ingresar su contraseña")
    private String password;
}