package com.ferreteria.ms_usuarios.dto;

import com.ferreteria.ms_usuarios.validation.RutValido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El RUT es obligatorio")
    @RutValido
    private String rut;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato valido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, max = 18, message = "La contraseña debe tener entre 6 y 18 caracteres")
    @ToString.Exclude
    private String password;

    @NotNull(message = "La dirección es obligatoria")
    @Valid
    private DireccionRequest direccion;
}