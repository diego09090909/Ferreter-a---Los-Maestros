package com.ferreteria.ms_usuarios.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener al menos 3 caracteres")
    private String nombre;

    @NotBlank(message = "El RUT es obligatorio")
    private String rut;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 18, message = "La contraseña debe tener entre 6 y 18 caracteres")
    private String password;

    @Valid
    private DireccionRequest direccion;
}