package com.ferreteria.ms_usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class CambiarPasswordRequest {
    
    @NotBlank (message = "Debe ingresar su contraseña actual")
    @ToString.Exclude
    private String passwordActual;

    @NotBlank (message = "Debe ingresar su nueva contraseña")
    @Size(min = 6, max = 18, message = "La nueva contraseña debe tener entre 6 y 18 caracteres")
    @ToString.Exclude
    private String passwordNueva;
}
